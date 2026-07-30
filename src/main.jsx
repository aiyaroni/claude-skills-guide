import { StrictMode } from 'react'
import { hydrateRoot, createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import AppRoutes from './routes.jsx'

const el = document.getElementById('root')
const tree = (
  <StrictMode>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </StrictMode>
)

// עמודי הפריטים מגיעים מ-prerender עם HTML מלא — עליהם מרטיבים במקום ליצור מחדש,
// אחרת התוכן שגוגל קיבל נמחק ונבנה שוב ברגע שה-JS עולה
if (el.hasChildNodes()) hydrateRoot(el, tree)
else createRoot(el).render(tree)
