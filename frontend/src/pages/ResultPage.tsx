import { BigButton } from '../components/BigButton'
import type { Result } from '../types/exercise'
export function ResultPage({result,onRetry,onNew,onReview}:{result:Result;onRetry:()=>void;onNew:()=>void;onReview:()=>void}) {
 const stars=Math.max(1,Math.round((result.correctCount/result.total)*5))
 return <main className="center-shell"><section className="result-card"><div className="celebration">🎉</div><p className="eyebrow">Hoàn thành rồi!</p><h1>Con đã làm rất tốt!</h1><div className="score"><strong>{result.correctCount}</strong><span>/ {result.total} câu đúng</span></div><div className="stars" aria-label={`${stars} ngôi sao`}>{'⭐'.repeat(stars)}</div><div className="result-actions"><BigButton onClick={onRetry}>↻ Làm lại</BigButton><BigButton className="secondary" onClick={onNew}>＋ Tạo đề mới</BigButton></div><button className="review-link" onClick={onReview}>Phụ huynh xem lại bài →</button></section></main>
}
