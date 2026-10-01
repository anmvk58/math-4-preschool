const floatingItems = [
  { label: '1', className: 'float-one' },
  { label: '+', className: 'float-plus' },
  { label: '3', className: 'float-three' },
  { label: '×', className: 'float-times' },
  { label: '7', className: 'float-seven' },
]

export function PlayfulBackground() {
  return <div className="playful-background" aria-hidden="true">
    <div className="sun"><span /></div>
    <div className="cloud cloud-one"><i /><i /><i /></div>
    <div className="cloud cloud-two"><i /><i /><i /></div>
    <div className="cloud cloud-three"><i /><i /><i /></div>
    <div className="sparkle sparkle-one">✦</div>
    <div className="sparkle sparkle-two">✦</div>
    <div className="sparkle sparkle-three">✦</div>
    {floatingItems.map(item => <span key={item.className} className={`floating-math ${item.className}`}>{item.label}</span>)}
    <div className="hill hill-back" />
    <div className="hill hill-front" />
    <div className="tiny-flowers">✿　✿　✿</div>
    <div className="math-buddy">
      <span className="buddy-ear buddy-ear-left" />
      <span className="buddy-ear buddy-ear-right" />
      <span className="buddy-eye buddy-eye-left" />
      <span className="buddy-eye buddy-eye-right" />
      <span className="buddy-smile">⌣</span>
      <span className="buddy-cheek buddy-cheek-left" />
      <span className="buddy-cheek buddy-cheek-right" />
      <span className="buddy-hand">●</span>
    </div>
    <div className="buddy-message">Cùng học nhé! <span>♥</span></div>
  </div>
}
