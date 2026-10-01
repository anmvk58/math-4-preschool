export function ProgressBar({current,total}:{current:number,total:number}) {
  const progress = total ? (current / total) * 100 : 0
  return <div className="progress-track" role="progressbar" aria-valuenow={current} aria-valuemin={0} aria-valuemax={total} aria-label="Tiến độ làm bài"><div style={{width:`${progress}%`}} /></div>
}
