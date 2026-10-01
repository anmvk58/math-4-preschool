import { useState } from 'react'
import { BigButton } from '../components/BigButton'
import { SoundToggle } from '../components/SoundToggle'
import type { Operation } from '../types/exercise'

const operations: {id:Operation;symbol:string;label:string}[] = [
  {id:'ADD',symbol:'+',label:'Cộng'}, {id:'SUBTRACT',symbol:'−',label:'Trừ'},
  {id:'MULTIPLY',symbol:'×',label:'Nhân'}, {id:'DIVIDE',symbol:'÷',label:'Chia'},
]
export function SetupPage({onStart,onStartMatching,loading,error,sound,onSound}:{onStart:(count:number,max:number,ops:Operation[])=>void;onStartMatching:(rounds:number,max:number)=>void;loading:boolean;error:string;sound:boolean;onSound:(v:boolean)=>void}) {
  const [count,setCount] = useState(10), [max,setMax] = useState(10)
  const [selected,setSelected] = useState<Operation[]>(['ADD','SUBTRACT'])
  const [activity,setActivity] = useState<'MATH'|'MATCHING'>('MATH')
  const [gameRounds,setGameRounds] = useState(5), [gameMax,setGameMax] = useState(10)
  const toggle = (op:Operation) => setSelected(v=>v.includes(op)?v.filter(x=>x!==op):[...v,op])
  return <main className="setup-shell">
    <header className="brand-row"><div className="brand-mark">123</div><div><h1>Toán vui mỗi ngày</h1><p>Cùng bé khám phá những con số</p></div><SoundToggle enabled={sound} onChange={onSound}/></header>
    <section className="setup-card" aria-labelledby="setup-title">
      <div className="eyebrow">Hoạt động hôm nay</div><h2 id="setup-title">Bé muốn chơi gì?</h2>
      <div className="activity-picker">
        <button className={`activity-card ${activity==='MATH'?'active':''}`} onClick={()=>setActivity('MATH')} aria-pressed={activity==='MATH'}><span className="activity-visual math-visual">1＋2</span><span><strong>Luyện phép tính</strong><small>Cộng, trừ, nhân và chia</small></span><b>✓</b></button>
        <button className={`activity-card ${activity==='MATCHING'?'active':''}`} onClick={()=>setActivity('MATCHING')} aria-pressed={activity==='MATCHING'}><span className="activity-visual matching-visual">🍎 → 3</span><span><strong>Nối hình với số</strong><small>Đếm hình và tìm số đúng</small></span><b>✓</b></button>
      </div>
      <div className="setup-divider"><span>{activity==='MATH'?'Tạo bài luyện':'Tạo lượt chơi'}</span></div>
      {activity==='MATH'?<>
      <fieldset><legend>Số câu hỏi</legend><div className="choice-grid four">{[5,10,15,20].map(n=><button key={n} className={count===n?'choice active':'choice'} onClick={()=>setCount(n)}>{n}<small>câu</small></button>)}</div>
        <label className="custom-field">Hoặc nhập số khác <input type="number" min="1" max="50" value={count} onChange={e=>setCount(Math.max(1,Math.min(50,Number(e.target.value))))}/></label></fieldset>
      <fieldset><legend>Phạm vi số</legend><div className="choice-grid five">{[5,10,20,50,100].map(n=><button key={n} className={max===n?'choice compact active':'choice compact'} onClick={()=>setMax(n)}>Đến {n}</button>)}</div>
        <label className="custom-field">Số lớn nhất <input type="number" min="1" max="1000" value={max} onChange={e=>setMax(Math.max(1,Math.min(1000,Number(e.target.value))))}/></label></fieldset>
      <fieldset><legend>Phép tính <span className="hint">Chọn một hoặc nhiều</span></legend><div className="operation-grid">{operations.map(op=><button key={op.id} aria-pressed={selected.includes(op.id)} className={selected.includes(op.id)?'operation active':'operation'} onClick={()=>toggle(op.id)}><span>{op.symbol}</span>{op.label}<b aria-hidden="true">{selected.includes(op.id)?'✓':''}</b></button>)}</div></fieldset>
      </>:<>
        <fieldset><legend>Số màn chơi</legend><div className="choice-grid three">{[3,5,8].map(n=><button key={n} className={gameRounds===n?'choice active':'choice'} onClick={()=>setGameRounds(n)}>{n}<small>màn</small></button>)}</div></fieldset>
        <fieldset><legend>Phạm vi đếm</legend><div className="choice-grid three">{[5,10,15].map(n=><button key={n} className={gameMax===n?'choice active':'choice'} onClick={()=>setGameMax(n)}>1 – {n}<small>{n===5?'Khởi động':n===10?'Vừa sức':'Thử thách'}</small></button>)}</div></fieldset>
        <div className="game-tip"><span>💡</span><p>Bé có thể <strong>kéo thả</strong> hoặc <strong>chạm hình rồi chạm số</strong> để nối.</p></div>
      </>}
      {error&&<p className="error" role="alert">{error}</p>}
      <BigButton disabled={loading||(activity==='MATH'&&selected.length===0)} onClick={()=>activity==='MATH'?onStart(count,max,selected):onStartMatching(gameRounds,gameMax)}>{loading?'Đang chuẩn bị…':activity==='MATH'?'Bắt đầu học':'Bắt đầu chơi'} <span aria-hidden="true">→</span></BigButton>
    </section><p className="parent-note">Không hẹn giờ · Không áp lực · Luôn khuyến khích bé</p>
  </main>
}
