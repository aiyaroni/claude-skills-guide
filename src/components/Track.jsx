/**
 * כרטיס מסלול לימוד אחד — סדרה לפי part_of/order.
 * מציג רק מה שכבר נקלט (ראה tracks() ב-items.js). בלי placeholder rows
 * למה שטרם נקלט — גדל אוטומטית כשעוד פריטים מאותה סדרה נכנסים לארכיון.
 */
export default function Track({ track, onOpen }) {
  return (
    <div className="track-card">
      <div className="track-head">
        <span className="track-name">{track.part_of}</span>
        <span className="track-count">{track.items.length} מדריכים בארכיון</span>
      </div>
      <div className="track-rows">
        {track.items.map(item => (
          <div key={item.id} className="track-row" onClick={() => onOpen(item)}>
            <span className="track-order"><bdi>{item.raw.order}</bdi></span>
            <span className="track-dot" aria-hidden="true">●</span>
            <span className="track-title">{item.title}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
