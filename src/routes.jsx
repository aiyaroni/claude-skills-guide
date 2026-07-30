import { Routes, Route } from 'react-router-dom'
import App from './App.jsx'

/**
 * מוגדר פעם אחת ומשמש גם את הדפדפן וגם את ה-prerender.
 * כשה-prerender מרנדר את App ישירות בלי הניתוב, useParams מחזיר ריק
 * וכל 198 העמודים יוצאים זהים לעמוד הבית.
 */
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/:kind/:slug" element={<App />} />
    </Routes>
  )
}
