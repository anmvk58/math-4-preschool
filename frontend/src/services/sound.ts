type SoundName = 'correct' | 'retry' | 'complete'

const melodies: Record<SoundName, number[]> = {
  correct: [659.25, 783.99, 987.77],
  retry: [392, 329.63, 261.63],
  complete: [523.25, 659.25, 783.99, 1046.5],
}

function createMelodyDataUri(frequencies: number[]) {
  const sampleRate = 22050
  const noteLength = 0.18
  const gap = 0.025
  const samplesPerNote = Math.floor(sampleRate * noteLength)
  const gapSamples = Math.floor(sampleRate * gap)
  const sampleCount = frequencies.length * (samplesPerNote + gapSamples)
  const bytes = new ArrayBuffer(44 + sampleCount * 2)
  const view = new DataView(bytes)
  const writeText = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i))
  }

  writeText(0, 'RIFF')
  view.setUint32(4, 36 + sampleCount * 2, true)
  writeText(8, 'WAVE')
  writeText(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeText(36, 'data')
  view.setUint32(40, sampleCount * 2, true)

  let sampleOffset = 0
  frequencies.forEach((frequency, noteIndex) => {
    for (let i = 0; i < samplesPerNote; i++) {
      const progress = i / samplesPerNote
      const envelope = Math.min(1, progress * 18, (1 - progress) * 12)
      const time = i / sampleRate
      const tone = Math.sin(2 * Math.PI * frequency * time) * 0.65
        + Math.sin(2 * Math.PI * frequency * 2 * time) * 0.12
      view.setInt16(44 + sampleOffset++ * 2, tone * envelope * 5000, true)
    }
    if (noteIndex < frequencies.length - 1) {
      for (let i = 0; i < gapSamples; i++) view.setInt16(44 + sampleOffset++ * 2, 0, true)
    }
  })

  const data = new Uint8Array(bytes)
  let binary = ''
  for (const byte of data) binary += String.fromCharCode(byte)
  return `data:audio/wav;base64,${btoa(binary)}`
}

const melodyAudio = Object.fromEntries(
  Object.entries(melodies).map(([name, frequencies]) => [name, createMelodyDataUri(frequencies)]),
) as Record<SoundName, string>

const voiceClips: Partial<Record<SoundName, string[]>> = {
  correct: ['correct_1.mp3', 'correct_2.mp3', 'correct_3.mp3'],
  retry: ['incorrect_1.mp3', 'incorrect_2.mp3'],
}

class SoundService {
  enabled = true
  private audioContext: AudioContext | null = null
  private activeVoiceClips = new Set<HTMLAudioElement>()

  setEnabled(value: boolean) {
    this.enabled = value
    if (!value) {
      for (const audio of this.activeVoiceClips) {
        audio.pause()
        audio.currentTime = 0
      }
      this.activeVoiceClips.clear()
    }
  }

  async play(name: SoundName) {
    if (!this.enabled || typeof window === 'undefined') return

    this.playVoiceClip(name)
    this.playMelody(name)
  }

  private playVoiceClip(name: SoundName) {
    const clips = voiceClips[name]
    if (!clips?.length) return

    const clip = clips[Math.floor(Math.random() * clips.length)]
    try {
      const audio = new Audio(`${import.meta.env.BASE_URL}audio/${clip}`)
      audio.volume = 0.9
      this.activeVoiceClips.add(audio)
      const cleanup = () => this.activeVoiceClips.delete(audio)
      audio.addEventListener('ended', cleanup, { once: true })
      audio.addEventListener('error', cleanup, { once: true })
      void audio.play().catch(cleanup)
    } catch {
      // Keep the visual feedback and music cue if voice playback is unavailable.
    }
  }

  private playMelody(name: SoundName) {
    if (typeof window.AudioContext === 'undefined') {
      try {
        const audio = new Audio(melodyAudio[name])
        audio.volume = 0.55
        void audio.play().catch(() => undefined)
      } catch {
        // Some embedded browsers block both Web Audio and media playback.
      }
      return
    }

    try {
      const AudioContextClass = window.AudioContext
      if (!AudioContextClass) return
      this.audioContext ??= new AudioContextClass()
      const context = this.audioContext
      if (context.state === 'suspended') void context.resume()

      const now = context.currentTime
      melodies[name].forEach((frequency, index) => {
        const start = now + index * 0.13
        const oscillator = context.createOscillator()
        const gain = context.createGain()
        oscillator.type = 'sine'
        oscillator.frequency.value = frequency
        gain.gain.setValueAtTime(0.0001, start)
        gain.gain.exponentialRampToValueAtTime(0.075, start + 0.025)
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.19)
        oscillator.connect(gain)
        gain.connect(context.destination)
        oscillator.start(start)
        oscillator.stop(start + 0.2)
      })
    } catch {
      // Audio is an enhancement; feedback remains visible if the device blocks it.
    }
  }

}

export const soundService = new SoundService()
