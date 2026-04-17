# Projects — CLAUDE.md

## מבנה הפרויקט (אחרי מיגרציה ל-React)

הפרויקט הוא **React + Vite + Tailwind + framer-motion**.

### קבצים לעריכה

| מה | איפה |
|----|------|
| סקילים רגילים | `src/data/skills.js` |
| חיבורי MCP | `src/data/mcp.js` |
| פייפליינים | `src/data/pipelines.js` |
| קטגוריות, צבעים, UC | `src/data/config.js` |
| State management | `src/store.jsx` |
| Components | `src/components/` |

### גיבוי

`backup/claude-skills-guide.html` — הקובץ הישן. **לא נוגעים בו.**

### הרצה מקומית

```bash
npm run dev   # http://localhost:5173 (או פורט זמין קרוב)
npm run build # בדיקת build לפני Vercel
```

---

## כשמוסיפים סקיל חדש

ערוך את הקובץ הרלוונטי (`skills.js` / `mcp.js`) והוסף אובייקט עם השדות:

```js
{
  cmd: "שם-הפקודה",
  cat: "post|agency|dev|docs|build|automation|telegram|hookify|plugins|mcp",
  uc: ["content", "design", "web", "slides", "automation", "qa", "analysis", "dev"],
  triggers: ["טריגר 1", "טריגר 2"],
  desc: "תיאור קצר — שורה אחת",
  detail: "הסבר מורחב...\n\nעם שורות חדשות",
  steps: [
    {t: 'כתוב את הפקודה', c: 'cmd-name'},         // ① — הפקודה
    {t: 'מה לכתוב ל-Claude', c: '"דוגמה קונקרטית"'}, // ② — קלט
    {t: 'מה מקבלים', c: null}                       // ③ — פלט
  ],
  usage: "תיאור שימוש"
}
```

**הרחבות MCP** — מבנה `detail` חייב לכלול:
1. פסקת פתיחה — מה הכלי
2. ⚠️ חשוב — אזהרה קריטית
3. מתי לבחור X ולא Y — disambiguation
4. דוגמאות ספציפיות עם `[ערך לשינוי]` בסוגריים מרובעים
5. מה [כלי] מחזיר

---

## update-skills-guide skill

קיים ב-`~/.claude/commands/update-skills-guide.md`

טריגר: "עדכן את מדריך הסקילים שלי" / "עדכן את הדף" / "תוסיף לדף"

**שים לב:** הסקיל עדיין מצביע על הקובץ הישן. יש לעדכן אותו כדי שיכתוב ל-`src/data/skills.js` ו-`src/data/mcp.js` במקום ל-`claude-skills-guide.html`.
