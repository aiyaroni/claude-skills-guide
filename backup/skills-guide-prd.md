# PRD — Claude Skills Guide Dashboard
**תאריך:** 2026-04-07 | **סטטוס:** מאושר לביצוע

---

## מהות המוצר

לוח בקרה אישי של ירוני לניהול וגילוי סקילים של Claude Code.
**לא** תיעוד. **לא** ויקי. **כן** — שולחן עבודה אינטראקטיבי.

---

## משתמש ומטרה

**מי:** ירוני — משתמש יומיומי של Claude Code, מנהל 50+ סקילים
**הכאב:** קשה לזכור מה קיים ואיך בדיוק להפעיל
**פעולה ראשית:** בחר פייפליין → עקוב אחרי שלבים → קבל פקודה מוכנה להעתקה
**פעולה משנית:** גלה וחפש סקיל ספציפי
**הצלחה:** תוך 10 שניות יודע מה להקליד ב-Claude Code

---

## Brand — Yaroni Studio

### פלטה
- `#0a0a0a` — רקע ראשי (שחור עמוק)
- `#111827` — surface (כרטיסים, סיידבר)
- `#ffffff` / `#e8e8e8` — טקסט ראשי
- `#9ca3af` — טקסט משני
- `#C5F206` — ירוק ליים (accent ראשי — פעולות, active states, CTA)
- `#f72585` — ורוד פוקסייה (accent משני — highlights, badges חשובים)
- פסטלים לקטגוריות:
  - פוסטים: `#e879f9` (סגול)
  - סוכנות: `#60a5fa` (כחול)
  - פיתוח: `#34d399` (ירוק מנטה)
  - תוכן: `#fbbf24` (צהוב)
  - בניה: `#a78bfa` (לבנדר)
  - אוטומציה: `#fb923c` (כתום)
  - טלגרם: `#38bdf8` (תכלת)
  - MCP: `#06b6d4` (cyan)

### פונטים
| שימוש | פונט | משקל |
|---|---|---|
| כותרות display (עברית + אנגלית) | Syne | 700-800 |
| גוף טקסט — עברית | Heebo | 300-400-600 |
| גוף טקסט — אנגלית | Heebo | 300-400-600 |
| פקודות + cmd names + labels טכניים | JetBrains Mono | 400-700 |

**כלל ברזל:** JetBrains Mono **רק** לפקודות, cmd names, ו-labels טכניים. לא לטקסט קריאה.

---

## אסתטיקה — Command Center (מבוסס Demo 1)

### מה אהבנו מ-Demo 1:
- Dark terminal aesthetic
- שעון חי בשורת status עליונה
- Mission cards לפייפליינים
- Step badges ממוספרים
- התחושה של "מרכז שליטה"

### מה לשפר:
- טקסט גוף ב-Heebo — קריא וברור
- צבע ליים ופוקסייה רק ל-accents
- לא מונוספייס לגוף
- יותר whitespace בתוך הכרטיסים

---

## מבנה Layout

### שלד
```
[STATUS BAR — top full width]
[SIDEBAR 260px] | [MAIN AREA — flex:1]
                  [PIPELINE BANNER — when pipeline active]
                  [SESSIONS HEADERS]
                  [CARDS GRID]
[SKILL DETAIL PANEL — 520px, slides from right]
```

### Status Bar (עליון)
- שעון חי
- מספר פייפליינים / סקילים פעילים
- "YARONI STUDIO · CLAUDE SKILLS"

### Sidebar
- **Logo area:** Yaroni Studio + tagline
- **Search**
- **PIPELINES** (section header) — כרטיסי mission לחיצים, עם emoji + שם + מספר שלבים
- **CATEGORIES** (section header) — כפתורי קטגוריה עם dot צבעוני + ספירה
- **USE CASES** (section header)

### Main Area — Browse Mode
- Grid: `repeat(auto-fill, minmax(270px, 1fr))`
- Section headers לפי קטגוריה

### Main Area — Pipeline Mode
- **Pipeline Banner:** `⚡ שם הפייפליין — תיאור   [× יציאה]`
- **Session headers** (אם יש sessions)
- כרטיסים עם `STEP 01 · label` badge
- **context.short** מוצג על הכרטיס בשורה נפרדת (ירוק ליים, italic)

---

## כרטיס סקיל

```
┌─────────────────────────────────┐
│ STEP 01 · מיפוי תהליך [badge]   │ (רק בפייפליין mode)
│                                  │
│ business-analyst  [סוכנות ●]     │ ← cmd בסין, dot קטגוריה
│                                  │
│ ניתוח KPIs, מודלים פרדיקטיביים  │ ← Heebo, #c8c8c8
│                                  │
│ 💬 "כל בוקר אני פותח Gmail..."  │ ← context.short (רק בפייפליין)
│                                  │
│ ⚡ אוטומטי  · לחץ לפרטים         │
└─────────────────────────────────┘
```

---

## Skill Detail Panel (נפתח בלחיצה)

### Browse Mode — תוכן גנרי:
1. שם + קטגוריה + תיאור קצר
2. **"מה זה עושה בפועל"** — detail המלא (Heebo, קריא)
3. **"איך משתמשים"** — steps רגילים
4. כפתור העתקה
5. "מה עושים עם התוצאה" — next actions
6. Triggers

### Pipeline Mode — תוכן ספציפי לפייפליין:
**ציר זמן 4 שלבים (timeline):**
```
━━● ① הפעלה — מה להקליד
  │   [business-analyst]  ← JetBrains Mono, לחיץ להעתקה
  │
━━● ② מה לכתוב ל-Claude
  │   "כל בוקר אני פותח Gmail..."  ← Heebo italic, ליים
  │
━━● ③ Claude ישאל אותך
  │   כמה פעמים? מה מפעיל? לאן המידע הולך?  ← Heebo, אפור
  │
━━● ④ מה מקבלים
      מפת תהליך + המלצות לאוטומציה  ← Heebo, לבן
```
אחרי ציר הזמן — detail הגנרי עדיין מוצג (מתקפל/מורחב)

---

## נתוני תוכן לדמו

### פייפליינים:
```js
[
  {
    id:'automation', name:'אוטומציה לעסק', emoji:'⚡',
    desc:'מיפוי תהליך → בניית workflow ב-n8n',
    steps:[
      { cmd:'business-analyst', label:'מיפוי תהליך',
        invoke:'business-analyst',
        write:'"כל בוקר אני פותח Gmail ומעתיק לידים לגיליון גוגל..."',
        asks:'Claude ישאל: כמה פעמים? מה מפעיל? לאן המידע הולך?',
        gets:'מפת תהליך מפורטת + זיהוי מה ניתן לאוטמט' },
      { cmd:'MCP · n8n', label:'בניית workflow',
        invoke:'פועל אוטומטית',
        write:'"תבנה workflow שמחבר Gmail לגיליון"',
        asks:'Claude ישאל: איזה טריגר? כל שעה? כשמגיע מייל?',
        gets:'workflow מוכן ב-n8n עם כל הצמתים והחיבורים' },
      { cmd:'MCP · Notion', label:'תיעוד ללקוח',
        invoke:'פועל אוטומטית',
        write:'"תכין דף Notion עם הוראות הפעלה ללא ידע טכני"',
        asks:'Claude ישאל: יש Notion workspace ללקוח? מה שם הפרויקט?',
        gets:'דף Notion מסודר מוכן למסירה ללקוח' }
    ]
  },
  {
    id:'reel', name:'ריל לאינסטגרם', emoji:'🎬',
    desc:'תמונות AI → קפשן מוכן',
    steps:[
      { cmd:'imagen-creative', label:'תמונות AI',
        invoke:'imagen-creative',
        write:'"מוצר: שמן ארגן. פלטפורמה: ריל. 5 קריאייטיבים"',
        asks:'Claude ישאל: מה הסגנון? אור טבעי / סטודיו / דרמטי?',
        gets:'5 תמונות PNG בתיקיית creative-pipeline/product-[name]/' },
      { cmd:'/post:post-instagram', label:'קפשן + hashtags',
        invoke:'/post:post-instagram',
        write:'"כתוב קפשן לריל על שמן ארגן"',
        asks:'Claude ישאל: מה ה-hook? מה ה-CTA?',
        gets:'קפשן מוכן בסגנון ירוני + 30 hashtags' }
    ]
  },
  {
    id:'carousel', name:'קרוסלה לאינסטגרם', emoji:'📸',
    desc:'מחקר → קרוסלה → קפשן',
    steps:[
      { cmd:'last30days', label:'מחקר טרנדים',
        invoke:'last30days',
        write:'"מה הטרנדים בתחום AI לעסקים החודש?"',
        asks:'Claude ישאל: לאיזה קהל? תחום ספציפי?',
        gets:'10 נושאים עם פוטנציאל ויראלי + זווית ייחודית לכל אחד' },
      { cmd:'carousel', label:'בניית קרוסלה',
        invoke:'carousel',
        write:'"בנה קרוסלה 7 שקופיות: AI שחוסך 3 שעות ביום"',
        asks:'Claude ישאל: מי הקהל? מה הפרופיל? מה הבעיה שפותרים?',
        gets:'7 שקופיות PNG מוכנות + structure מוכן לעלייה' },
      { cmd:'/post:post-instagram', label:'קפשן',
        invoke:'/post:post-instagram',
        write:'"קפשן לקרוסלה על AI"',
        asks:'Claude ישאל: מה בשקופית הראשונה?',
        gets:'קפשן בסגנון ירוני + hashtags' }
    ]
  }
]
```

### סקילים (10):
```js
[
  { cmd:'business-analyst', cat:'agency', color:'#60a5fa',
    desc:'ניתוח KPIs, מודלים פרדיקטיביים, המלצות אסטרטגיות',
    detail:'הופך Claude לאנליסט עסקי בכיר. מנתח נתונים, בונה מדדי הצלחה, מזהה טרנדים ומחזיר המלצות מבוססות מספרים.',
    invoke:'business-analyst', type:'auto' },
  { cmd:'carousel', cat:'content', color:'#fbbf24',
    desc:'בונה קרוסלה לאינסטגרם — 7 שקופיות PNG מוכנות',
    detail:'יוצר קרוסלה שיווקית מלאה עם מבנה פסיכולוגי, קופי, ועיצוב. מייצא PNG מוכן לעלייה.',
    invoke:'carousel', type:'auto' },
  { cmd:'MCP · n8n', cat:'automation', color:'#fb923c',
    desc:'יצירת automation workflows ישירות ב-n8n',
    detail:'מחובר ישירות ל-n8n. בונה workflows, מגדיר triggers, מחבר APIs — הכל בשיחה.',
    invoke:'אוטומטי', type:'mcp' },
  { cmd:'/post:post-instagram', cat:'post', color:'#e879f9',
    desc:'קפשן + hashtags לאינסטגרם בסגנון ירוני',
    detail:'כותב קפשן בקול של ירוני — hook חזק, CTA ברור, 30 hashtags רלוונטיים.',
    invoke:'/post:post-instagram', type:'slash' },
  { cmd:'humanizer', cat:'content', color:'#fbbf24',
    desc:'מסיר סממני AI — נשמע כמו בן אדם',
    detail:'עובר על הטקסט ומחליף ביטויים רובוטיים בשפה טבעית ואנושית. שומר על המשמעות.',
    invoke:'humanizer', type:'auto' },
  { cmd:'copywriting', cat:'content', color:'#fbbf24',
    desc:'קופי שיווקי ממיר — ads, landing page, emails',
    detail:'כותב קופי מבוסס פסיכולוגיה שיווקית. מתאים לטון המותג ולקהל היעד.',
    invoke:'copywriting', type:'auto' },
  { cmd:'creative-brief', cat:'build', color:'#a78bfa',
    desc:'ברייף → Imagen AI → פרומפטים ל-Kling',
    detail:'פייפליין מלא: קולט ברייף → מייצר קריאייטיבים עם Imagen 3 → מכין פרומפטים להנפשה ב-Kling.',
    invoke:'creative-brief', type:'auto' },
  { cmd:'landing-page-copywriter', cat:'build', color:'#a78bfa',
    desc:'קופי ממיר לדף נחיתה — headline, sub, CTA',
    detail:'בונה את כל שכבות הקופי לדף נחיתה: כותרת, תת-כותרת, USPs, FAQs, ו-CTA.',
    invoke:'landing-page-copywriter', type:'auto' },
  { cmd:'MCP · Notion', cat:'automation', color:'#fb923c',
    desc:'יצירה ועדכון דפים ב-Notion מהשיחה',
    detail:'מחובר ישירות ל-Notion. יוצר דפים, מעדכן תוכן, בונה מבנה — ללא פתיחת Notion.',
    invoke:'אוטומטי', type:'mcp' },
  { cmd:'webapp-testing', cat:'dev', color:'#34d399',
    desc:'בדיקות אוטומטיות לאפליקציה — Playwright',
    detail:'כותב ומריץ בדיקות E2E עם Playwright. בודק accessibility, UI, ו-user flows.',
    invoke:'webapp-testing', type:'auto' }
]
```

---

## אינטראקציות

| פעולה | תוצאה |
|---|---|
| לחיצה על pipeline בסיידבר | Pipeline Mode — גריד מתחלף לשלבים ממוספרים |
| לחיצה על כרטיס בפייפליין | Detail Panel נפתח עם ציר זמן 4 שלבים |
| לחיצה על כרטיס בגלישה | Detail Panel נפתח עם תוכן גנרי |
| לחיצה על פקודה ב-detail | מועתקת ל-clipboard + toast "הועתק" |
| לחיצה על "× יציאה" | חזרה ל-Browse Mode |
| הקלדה בחיפוש | פילטור כרטיסים בזמן אמת |

---

## דרישות טכניות

- קובץ HTML יחיד — standalone, ללא תלויות מקומיות
- Google Fonts: Syne + Heebo + JetBrains Mono
- Lucide icons (CDN)
- JavaScript ללא frameworks
- RTL direction
- מוכן להשקה כ-static site
