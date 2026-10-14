import { useEffect, useState } from 'react'
import { ProgressBar } from '../components/ProgressBar'
import { SoundToggle } from '../components/SoundToggle'
import { matchingApi } from '../services/matchingApi'
import { soundService } from '../services/sound'
import type { MatchingGame } from '../types/matchingGame'

const pairColors = ['peach','mint','lavender']
const instruction = 'Kéo miếng hình vào miếng số đúng để ghép nhé!'

function PuzzleShape({ socket = false }: { socket?: boolean }) {
  return <svg className="puzzle-shape" viewBox={socket ? '0 0 180 128' : '0 0 400 128'} preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <path vectorEffect="non-scaling-stroke" d={socket
      ? 'M 16 3 H 164 Q 177 3 177 16 V 112 Q 177 125 164 125 H 16 Q 3 125 3 112 V 82 C 29 90 29 38 3 46 V 16 Q 3 3 16 3 Z'
      : 'M 16 3 H 364 Q 377 3 377 16 V 46 C 403 38 403 90 377 82 V 112 Q 377 125 364 125 H 16 Q 3 125 3 112 V 16 Q 3 3 16 3 Z'} />
  </svg>
}

export function MatchingGamePage({game,sound,onSound,onExit,onComplete}:{game:MatchingGame;sound:boolean;onSound:(value:boolean)=>void;onExit:()=>void;onComplete:()=>void}) {
  const [roundIndex,setRoundIndex] = useState(0)
  const [selected,setSelected] = useState<string|null>(null)
  const [matched,setMatched] = useState<Record<string,number>>({})
  const [feedback,setFeedback] = useState(instruction)
  const [dragging,setDragging] = useState<string|null>(null)
  const [dropTarget,setDropTarget] = useState<number|null>(null)
  const [wrongNumber,setWrongNumber] = useState<number|null>(null)
  const [busy,setBusy] = useState(false)
  const round = game.rounds[roundIndex]

  useEffect(()=>{
    setSelected(null)
    setMatched({})
    setDragging(null)
    setDropTarget(null)
    setFeedback(instruction)
  },[roundIndex])

  const connect = async(itemId:string,number:number) => {
    if(busy||matched[itemId]!==undefined||Object.values(matched).includes(number)) return
    setBusy(true)
    try {
      const response=await matchingApi.answer(game.gameId,round.id,itemId,number)
      if(response.correct){
        const next={...matched,[itemId]:number}
        setMatched(next);setSelected(null);setFeedback('Đúng rồi! Hai miếng đã ghép với nhau! 🎉');soundService.play('correct')
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
  const onDrop=(event:React.DragEvent<HTMLButtonElement>,number:number)=>{event.preventDefault();setDragging(null);setDropTarget(null);const itemId=event.dataTransfer.getData('text/plain');if(itemId) void connect(itemId,number)}

  return <main className="matching-shell">
    <header className="matching-top">
      <div className="matching-progress"><p>Màn {roundIndex+1} / {game.rounds.length}</p><ProgressBar current={roundIndex+1} total={game.rounds.length}/></div>
      <div className="exercise-actions"><button className="exit-button" onClick={onExit} aria-label="Về chọn trò chơi"><span className="exit-icon" aria-hidden="true">↩</span><span className="exit-label">Về chọn trò chơi</span></button><SoundToggle enabled={sound} onChange={onSound}/></div>
    </header>
    <section className="matching-board" aria-labelledby="matching-title">
      <div className="matching-heading"><span className="matching-theme-icon">🎯</span><div><p className="eyebrow">{round.theme}</p><h1 id="matching-title">Nối hình với số đúng</h1></div></div>
      <p className="puzzle-instruction"><span aria-hidden="true">🧩</span><span className="drop-hint">Kéo miếng hình <b aria-hidden="true">→</b> Ghép vào số đúng</span><span className="tap-hint">Chạm miếng hình <b aria-hidden="true">→</b> Chạm số đúng</span></p>
      <div className="matching-columns">
        <div className="picture-column" aria-label="Các nhóm hình">
          <h2>Miếng hình</h2>
          {round.items.map((item,index)=>{
            const isMatched=matched[item.id]!==undefined
            return <button key={item.id} draggable={!isMatched&&!busy} onDragStart={event=>{event.dataTransfer.setData('text/plain',item.id);event.dataTransfer.effectAllowed='move';setDragging(item.id);setSelected(item.id)}} onDragEnd={()=>{setDragging(null);setDropTarget(null)}} onClick={()=>!isMatched&&!busy&&setSelected(item.id)} disabled={isMatched} className={`picture-card puzzle-piece ${pairColors[index]} ${selected===item.id?'selected':''} ${dragging===item.id?'dragging':''} ${isMatched?'matched':''}`} aria-pressed={selected===item.id} aria-label={`Nhóm hình ${index+1}${isMatched?', đã ghép':', kéo vào số đúng hoặc chạm để chọn'}`}>
              <PuzzleShape />
              <span className="emoji-group">{Array.from({length:item.quantity},(_,emojiIndex)=><span key={emojiIndex}>{item.emoji}</span>)}</span>
              <span className="picture-status">{isMatched?'✓ Đã ghép':<><span className="drop-hint">⠿ Kéo để ghép <b aria-hidden="true">→</b></span><span className="tap-hint">Chạm để chọn</span></>}</span>
            </button>
          })}
        </div>
        <div className="number-column" aria-label="Các số để nối">
          <h2>Miếng số</h2>
          {round.numbers.map(number=>{
            const matchedEntry=Object.entries(matched).find(([,value])=>value===number)
            const itemIndex=matchedEntry?round.items.findIndex(item=>item.id===matchedEntry[0]):-1
            return <button key={number} onClick={()=>chooseNumber(number)} onDragOver={event=>{if(dragging&&!busy){event.preventDefault();event.dataTransfer.dropEffect='move';setDropTarget(number)}}} onDragLeave={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))setDropTarget(null)}} onDrop={event=>onDrop(event,number)} disabled={itemIndex>=0||busy} className={`number-card puzzle-piece ${dragging&&itemIndex<0?'drop-ready':''} ${dropTarget===number?'drop-active':''} ${wrongNumber===number?'wrong':''} ${itemIndex>=0?`matched ${pairColors[itemIndex]}`:''}`} aria-label={`Số ${number}${itemIndex>=0?', đã ghép':', thả miếng hình vào đây hoặc chạm để ghép'}`}>
              <PuzzleShape socket />
              <span className="puzzle-number">{number}</span><small>{itemIndex>=0?'✓ Đã ghép':<><span className="drop-hint">Thả vào đây</span><span className="tap-hint">Chạm số</span></>}</small>
            </button>
          })}
        </div>
      </div>
      <div className={`matching-feedback ${wrongNumber!==null?'retry':''}`} role="status">{feedback===instruction?<><span className="drop-hint">{instruction}</span><span className="tap-hint">Chạm miếng hình, rồi chạm số đúng để ghép nhé!</span></>:feedback}</div>
    </section>
  </main>
}
