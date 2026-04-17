# תכנית עבודה — שדרוג claude-skills-guide.html
**תאריך:** 2026-04-07
**קובץ יעד:** `/Users/yaroni/projects/claude-skills-guide.html`

---

## סטטוס משימות

### Phase 1 — תיקון פייפליינים (לוגיקה)
מטרה: כל שלב בפייפליין חייב להיות נדרש, לא כפול, ובסדר נכון.

- [x] **automation-business (פנימי)** — הוסר `schedule` + `telegram:configure`
- [x] **automation-business (ללקוח)** — הוסר `telegram:configure`
- [x] **landing-page** — הוסר `copywriting` (כפילות)
- [x] **community** — `last30days` הועבר לראשון
- [x] **client-report** — הוסר `docx`; `humanizer` הועבר לפני `pptx`
- [x] **deep-research** — הוסר `MCP · context7`
- [x] **reel-creator** — שונה למבנה sessions עם שני מסלולים (Remotion / Imagen)

### Phase 2 — הוספת הפעלה ברורה
מטרה: כל סקיל בכל פייפליין יציג בפאנל ההרחבה מה בדיוק להקליד.

- [ ] שלב 1 בציר הזמן (timeline) יכלול:
  - slash command: הצג את הפקודה המדויקת לחיצה להעתקה
  - סקיל רגיל: הצג שם הסקיל + "הקלד ב-Claude Code"
  - MCP: "פועל אוטומטית — Claude מזהה לבד"
- [ ] לוודא שה-context object קיים לכל שלב בפייפליין automation-business (הפיילוט)
- [ ] להוסיף context לשאר הפייפליינים לאחר אישור

### Phase 3 — תיקיית פלט בהרחבה (סעיף 9)
מטרה: המשתמש יודע איפה ימצא את התוצרים.

סקילים עם פלט קבצים:
| סקיל | תיקיית פלט |
|---|---|
| imagen-creative | `creative-pipeline/product-[name]/creatives/` |
| creative-brief | `creative-pipeline/product-[name]/` |
| kling-prompts | `creative-pipeline/product-[name]/kling-prompts.txt` |
| carousel | ייצוא PNG ל-`/Desktop/carousel-[date]/` (לברר) |
| pptx | ייצוא PPTX ל-תיקיית ההורדות |
| docx | ייצוא DOCX ל-תיקיית ההורדות |
| xlsx | ייצוא XLSX ל-תיקיית ההורדות |
| skill-guide | PDF ל-תיקיית ההורדות |

- [ ] הוסף שדה `outputDir` לכל skill רלוונטי ב-DEFAULT_SKILLS
- [ ] הצג בהרחבה: `📁 התוצרים נשמרים ב: [path]`

### Phase 4 — שדרוג ממשק (frontend-design) ✅
- [x] Meta tags website-ready (description, theme-color)
- [x] CSS מאורגן ב-8 sections עם תגיות
- [x] Sidebar: 240px, scrollbar lime-tinted
- [x] Skill cards: hover -2px, ::after gradient overlay
- [x] Pipeline cards: cubic-bezier transition, glow effect על active
- [x] Pipeline banner: gradient background, rounded
- [x] Drawer: רחב ל-500px
- [x] Session headers: JetBrains Mono uppercase
- [x] Custom scrollbars (lime accent)
- [x] smooth scroll

### Phase 5 — QA ✅
- [x] JS syntax valid
- [x] 16/16 בדיקות נתונים עברו
- [x] גודל קובץ תקין: 178KB
- [x] Meta tags קיימים
- [x] CSS sections מאורגנות
- [ ] Mobile responsive — לא נבדק (ידני)
- [ ] תיקיות פלט בהרחבה — Phase 3 עדיין ממתין

---

## הערות ושאלות פתוחות

1. **reel-creator** — מבנה חלופות: האם להציג רק שלב בחירה ואז שני מסלולים? או כרטיס "OR" ביניהם?
2. **carousel** — לאן מיוצאות התמונות? לברר מ-SKILL.md
3. **שדרוג ממשק** — ממוקד או מעמיק? (ממתין לאישור)
4. **context לשאר פייפליינים** — מי כותב? אוטומטי ע"י סאב-אייג'נט?

---

## סדר ביצוע מוסכם
Phase 1 → Phase 2 → Phase 3 → אישור Phase 4 → Phase 4 → Phase 5
