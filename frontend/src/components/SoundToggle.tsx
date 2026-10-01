export function SoundToggle({enabled,onChange}:{enabled:boolean,onChange:(value:boolean)=>void}) {
  return <button className="sound-toggle" onClick={()=>onChange(!enabled)} aria-pressed={enabled} aria-label={`${enabled?'Tắt':'Bật'} âm thanh`}>{enabled?'🔊':'🔇'} <span>Âm thanh</span></button>
}
