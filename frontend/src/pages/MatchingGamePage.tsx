import { useEffect, useState } from 'react'
import { ProgressBar } from '../components/ProgressBar'
import { SoundToggle } from '../components/SoundToggle'
import { matchingApi } from '../services/matchingApi'
import { soundService } from '../services/sound'
import type { MatchingGame } from '../types/matchingGame'

const pairColors = ['peach','mint','lavender']

export function MatchingGamePage({game,sound,onSound,onExit,onComplete}:{game:MatchingGame;sound:boolean;onSound:(value:boolean)=>void;onExit:()=>void;onComplete:()=>void}) {
  const [roundIndex,setRoundIndex] = useState(0)
  const [selected,setSelected] = useState<string|null>(null)
  const [matched,setMatched] = useState<Record<string,number>>({})
  const [feedback,setFeedback] = useState('Chạm vào nhóm hình, rồi chọn số đúng nhé!')
  const [wrongNumber,setWrongNumber] = useState<number|null>(null)
  const [busy,setBusy] = useState(false)
  const round = game.rounds[roundIndex]

  useEffect(()=>{
    setSelected(null)
    setMatched({})
    setFeedback('Chạm vào nhóm hình, rồi chọn số đúng nhé!')
  },[roundIndex])

  const connect = async(itemId:string,number:number) => {
    if(busy||matched[itemId]!==undefined||Object.values(matched).includes(number)) return
    setBusy(true)
    try {
      const response=await matchingApi.answer(game.gameId,round.id,itemId,number)
      if(response.correct){
        const next={...matched,[itemId]:number}
        setMatched(next);setSelected(null);setFeedback('Đúng rồi! Bé nối giỏi lắm! 🎉');soundService.play('correct')
        if(Object.keys(next).length===round.items.length){
          setTimeout(()=>{
            if(roundIndex===game.rounds.length-1) onComplete()
            else setRoundIndex(value=>value+1)
          },1200)
        }
      } else {
        setWrongNumber(number);setFeedback('Gần đúng rồi, bé đếm lại nhé! 😊');soundService.play('retry')
        setTimeout(()=>setWrongNumber(null),550)
      }
    } catch(error) {
      setFeedback(error instanceof Error?error.message:'Thử lại nhé!')
    } finally { setBusy(false) }
  }

  const chooseNumber=(number:number)=>{if(selected) void connect(selected,number);else setFeedback('Bé hãy chọn một nhóm hình trước nhé!')}
  const onDrop=(event:React.DragEvent<HTMLButtonElement>,number:number)=>{event.preventDefault();const itemId=event.dataTransfer.getData('text/plain');if(itemId) void connect(itemId,number)}

  return <main className="matching-shell">
    <header className="matching-top">
      <div className="matching-progress"><p>Màn {roundIndex+1} / {game.rounds.length}</p><ProgressBar current={roundIndex+1} total={game.rounds.length}/></div>
      <div className="exercise-actions"><button className="exit-button" onClick={onExit}><span className="exit-icon">↩</span><span className="exit-label">Về chọn trò chơi</span></button><SoundToggle enabled={sound} onChange={onSound}/></div>
    </header>
    <section className="matching-board" aria-labelledby="matching-title">
      <div className="matching-heading"><span className="matching-theme-icon">🎯</span><div><p className="eyebrow">{round.theme}</p><h1 id="matching-title">Nối hình với số đúng</h1></div></div>
      <div className="matching-columns">
        <div className="picture-column" aria-label="Các nhóm hình">
          <h2>Đếm hình</h2>
          {round.items.map((item,index)=>{
            const isMatched=matched[item.id]!==undefined
            return <button key={item.id} draggable={!isMatched} onDragStart={event=>event.dataTransfer.setData('text/plain',item.id)} onClick={()=>!isMatched&&setSelected(item.id)} className={`picture-card ${selected===item.id?'selected':''} ${isMatched?`matched ${pairColors[index]}`:''}`} aria-pressed={selected===item.id}>
              <span className="emoji-group">{Array.from({length:item.quantity},(_,emojiIndex)=><span key={emojiIndex}>{item.emoji}</span>)}</span>
              <span className="picture-status">{isMatched?'✓ Đã nối':'Chọn nhóm này'}</span>
            </button>
          })}
        </div>
        <div className="number-column" aria-label="Các số để nối">
          <h2>Chọn số</h2>
          {round.numbers.map(number=>{
            const matchedEntry=Object.entries(matched).find(([,value])=>value===number)
            const itemIndex=matchedEntry?round.items.findIndex(item=>item.id===matchedEntry[0]):-1
            return <button key={number} onClick={()=>chooseNumber(number)} onDragOver={event=>event.preventDefault()} onDrop={event=>onDrop(event,number)} disabled={itemIndex>=0} className={`number-card ${wrongNumber===number?'wrong':''} ${itemIndex>=0?`matched ${pairColors[itemIndex]}`:''}`}>
              {number}<small>{itemIndex>=0?'✓':'Thả vào đây'}</small>
            </button>
          })}
        </div>
      </div>
      <div className={`matching-feedback ${wrongNumber!==null?'retry':''}`} role="status">{feedback}</div>
    </section>
  </main>
}
