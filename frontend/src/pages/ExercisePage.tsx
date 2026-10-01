import { useEffect, useRef, useState } from 'react'
import { BigButton } from '../components/BigButton'
import { ProgressBar } from '../components/ProgressBar'
import { SoundToggle } from '../components/SoundToggle'
import type { Exercise, QuestionStatus } from '../types/exercise'

const praise = ['Chính xác!','Giỏi lắm!','Tuyệt vời!','Làm tốt lắm!']
export function ExercisePage({exercise,index,values,statuses,feedback,busy,sound,onSound,onChange,onSubmit,onMove,onExit}:{exercise:Exercise;index:number;values:string[];statuses:QuestionStatus[];feedback:string;busy:boolean;sound:boolean;onSound:(v:boolean)=>void;onChange:(v:string)=>void;onSubmit:()=>void;onMove:(delta:number)=>void;onExit:()=>void}) {
  const input = useRef<HTMLInputElement>(null), question=exercise.questions[index]
  useEffect(()=>{if(!busy&&statuses[index]!=='CORRECT')input.current?.focus()},[index,feedback,busy,statuses])
  useEffect(()=>{const handler=(e:KeyboardEvent)=>{if(e.key==='ArrowLeft'){e.preventDefault();onMove(-1)} if(e.key==='ArrowRight'){e.preventDefault();onMove(1)}};window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler)},[onMove])
  return <main className="exercise-shell"><header className="exercise-top"><div><p>Câu {index+1} / {exercise.questions.length}</p><ProgressBar current={index+1} total={exercise.questions.length}/></div><div className="exercise-actions"><button className="exit-button" type="button" onClick={onExit} aria-label="Về tạo đề"><span className="exit-icon" aria-hidden="true">↩</span><span className="exit-label">Về tạo đề</span></button><SoundToggle enabled={sound} onChange={onSound}/></div></header>
    <section className="question-area" aria-live="polite"><div className="question-number">{question.display}</div>
      <form onSubmit={e=>{e.preventDefault();onSubmit()}}><label htmlFor="answer" className="sr-only">Nhập đáp án</label><input ref={input} id="answer" className={`answer-input ${statuses[index].toLowerCase()}`} inputMode="numeric" pattern="[0-9]*" autoComplete="off" value={values[index]} onChange={e=>onChange(e.target.value.replace(/[^0-9]/g,''))} disabled={busy||statuses[index]==='CORRECT'} placeholder="?"/>
      <BigButton type="submit" disabled={busy||!values[index]||statuses[index]==='CORRECT'}>Kiểm tra</BigButton></form>
      <div className={`feedback ${statuses[index].toLowerCase()}`} role="status">{feedback&&(statuses[index]==='CORRECT'?`🎉 ${feedback||praise[0]}`:`😊 ${feedback}`)}</div>
    </section><nav className="question-nav" aria-label="Chuyển câu"><button onClick={()=>onMove(-1)} disabled={index===0}>← <span>Câu trước</span></button><span className="keyboard-tip">Nhấn Enter để kiểm tra</span><button onClick={()=>onMove(1)} disabled={index===exercise.questions.length-1}><span>Câu sau</span> →</button></nav>
  </main>
}
