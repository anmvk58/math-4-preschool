import { BigButton } from '../components/BigButton'

export function MatchingResultPage({total,onReplay,onNew}:{total:number;onReplay:()=>void;onNew:()=>void}) {
  return <main className="center-shell"><section className="result-card matching-result-card">
    <div className="celebration">🏆</div><p className="eyebrow">Nối hình siêu giỏi!</p><h1>Bé đã hoàn thành!</h1>
    <p className="matching-result-copy">Bé đã vượt qua <strong>{total} màn chơi</strong> và nối đúng tất cả các nhóm hình.</p>
    <div className="stars" aria-label="5 ngôi sao">⭐⭐⭐⭐⭐</div>
    <div className="result-actions"><BigButton onClick={onReplay}>↻ Chơi lại</BigButton><BigButton className="secondary" onClick={onNew}>⌂ Chọn hoạt động</BigButton></div>
  </section></main>
}
