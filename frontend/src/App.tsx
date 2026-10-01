import { useCallback, useState } from 'react'
import { SetupPage } from './pages/SetupPage'
import { ExercisePage } from './pages/ExercisePage'
import { ResultPage } from './pages/ResultPage'
import { ReviewPage } from './pages/ReviewPage'
import { MatchingGamePage } from './pages/MatchingGamePage'
import { MatchingResultPage } from './pages/MatchingResultPage'
import { exerciseApi } from './services/exerciseApi'
import { matchingApi } from './services/matchingApi'
import { soundService } from './services/sound'
import type { Exercise, Operation, QuestionStatus, Result } from './types/exercise'
import type { MatchingGame } from './types/matchingGame'
type Page='setup'|'exercise'|'result'|'review'|'matching'|'matching-result'
export default function App(){
 const [page,setPage]=useState<Page>('setup'),[exercise,setExercise]=useState<Exercise|null>(null),[index,setIndex]=useState(0)
 const [values,setValues]=useState<string[]>([]),[statuses,setStatuses]=useState<QuestionStatus[]>([]),[feedback,setFeedback]=useState('')
 const [result,setResult]=useState<Result|null>(null),[loading,setLoading]=useState(false),[error,setError]=useState(''),[sound,setSound]=useState(true)
 const [matchingGame,setMatchingGame]=useState<MatchingGame|null>(null)
 const changeSound=(v:boolean)=>{setSound(v);soundService.setEnabled(v)}
 const start=async(count:number,max:number,ops:Operation[])=>{setLoading(true);setError('');try{const data=await exerciseApi.generate(count,max,ops);setExercise(data);setValues(data.questions.map(()=>''));setStatuses(data.questions.map(()=>'UNANSWERED'));setIndex(0);setPage('exercise')}catch(e){setError(e instanceof Error?e.message:'Có lỗi xảy ra')}finally{setLoading(false)}}
 const startMatching=async(rounds:number,max:number)=>{setLoading(true);setError('');try{const data=await matchingApi.generate(rounds,max);setMatchingGame(data);setPage('matching')}catch(e){setError(e instanceof Error?e.message:'Có lỗi xảy ra')}finally{setLoading(false)}}
 const finish=async(ex:Exercise)=>{const data=await exerciseApi.result(ex.exerciseId);setResult(data);soundService.play('complete');setPage('result')}
 const move=useCallback((delta:number)=>{if(!exercise)return;setFeedback('');setIndex(i=>Math.max(0,Math.min(exercise.questions.length-1,i+delta)))},[exercise])
 const submit=async()=>{if(!exercise||!values[index])return;setLoading(true);try{const response=await exerciseApi.answer(exercise.exerciseId,exercise.questions[index].id,Number(values[index]));const next=[...statuses];next[index]=response.correct?'CORRECT':'INCORRECT';setStatuses(next);if(response.correct){const phrase=['Chính xác!','Làm tốt lắm!','Bé đã trả lời đúng!'][Math.floor(Math.random()*3)];soundService.play('correct');setFeedback(phrase);setTimeout(()=>{if(next.every(status=>status==='CORRECT')){finish(exercise);return}const nextUnanswered=next.findIndex((status,i)=>i>index&&status!=='CORRECT');const firstUnanswered=next.findIndex(status=>status!=='CORRECT');setFeedback('');setIndex(nextUnanswered>=0?nextUnanswered:firstUnanswered)},1800)}else{setValues(current=>current.map((value,i)=>i===index?'':value));const phrase=['Chưa đúng rồi.','Bé thử lại nhé!'][Math.floor(Math.random()*2)];soundService.play('retry');setFeedback(phrase)}}catch(e){setFeedback(e instanceof Error?e.message:'Thử lại nhé!')}finally{setLoading(false)}}
 const retry=()=>{if(!exercise)return;setValues(exercise.questions.map(()=>''));setStatuses(exercise.questions.map(()=>'UNANSWERED'));setIndex(0);setFeedback('');setPage('exercise')}
 if(page==='setup')return <SetupPage onStart={start} onStartMatching={startMatching} loading={loading} error={error} sound={sound} onSound={changeSound}/>
 if(page==='matching'&&matchingGame)return <MatchingGamePage game={matchingGame} sound={sound} onSound={changeSound} onExit={()=>setPage('setup')} onComplete={()=>{soundService.play('complete');setPage('matching-result')}}/>
 if(page==='matching-result'&&matchingGame)return <MatchingResultPage total={matchingGame.rounds.length} onReplay={()=>startMatching(matchingGame.rounds.length,Math.max(...matchingGame.rounds.flatMap(round=>round.numbers)))} onNew={()=>setPage('setup')}/>
 if(page==='exercise'&&exercise)return <ExercisePage exercise={exercise} index={index} values={values} statuses={statuses} feedback={feedback} busy={loading} sound={sound} onSound={changeSound} onChange={v=>setValues(a=>a.map((x,i)=>i===index?v:x))} onSubmit={submit} onMove={move} onExit={()=>{setError('');setPage('setup')}}/>
 if(page==='review'&&result)return <ReviewPage result={result} onBack={()=>setPage('result')}/>
 if(result)return <ResultPage result={result} onRetry={retry} onNew={()=>setPage('setup')} onReview={()=>setPage('review')}/>
 return null
}
