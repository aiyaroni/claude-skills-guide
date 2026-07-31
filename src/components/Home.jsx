import { TASK_ORDER, TASKS } from '../data/config.js'
import Track from './Track.jsx'

/**
 * שלוש שכבות: נקלט לאחרונה (נעלם אם ריק) → שערי משימה → מסלולי לימוד.
 * שדה החיפוש עצמו הוא ה-kbar הקיים בכותרת, לא רכיב נפרד — נמנעים מכפילות.
 * hero הפייפליינים יורד למטה מכאן (מטופל ב-App.jsx).
 */
export default function Home({ recent, taskCounts, tracksList, onTaskClick, onOpen }) {
  return (
    <div className="home-layers">
      {recent.length > 0 && (
        <section className="recent-block">
          <div className="aside-title"><span>נקלט לאחרונה</span></div>
          <div className="recent-list">
            {recent.map(item => (
              <div key={item.id} className="recent-row" onClick={() => onOpen(item)}>
                <span className="recent-title">{item.title}</span>
                <span className="recent-date"><bdi>{item.raw?.ingested_at}</bdi></span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="task-gates">
        <div className="aside-title"><span>מה אתה בא לעשות?</span></div>
        <div className="task-grid">
          {TASK_ORDER.map(key => (
            <div key={key} className="task-tile" onClick={() => onTaskClick(key)}>
              <span className="task-label">{TASKS[key].label}</span>
              <span className="task-count"><bdi>{taskCounts[key] || 0}</bdi></span>
            </div>
          ))}
        </div>
      </section>

      {tracksList.length > 0 && (
        <section className="tracks-block">
          <div className="aside-title"><span>מסלולי לימוד</span></div>
          {tracksList.map(t => (
            <Track key={t.part_of} track={t} onOpen={onOpen} />
          ))}
        </section>
      )}
    </div>
  )
}
