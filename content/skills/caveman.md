---
id: caveman
type: skill
title: Caveman — דחיסת תגובות לחיסכון בטוקנים
summary: גורם לקלוד לענות בסגנון תמציתי. חוסך טוקנים בפלט בלי לפגוע בדיוק הטכני
tags: [tokens, claude-code]
source_url: https://github.com/juliusbrussee/caveman
source_name: מדריך Caveman · Ponytail
source_date: 2026-07
ingested_at: 2026-07-30
completeness: full
private: false

cmd: caveman
install_cmd: "curl -fsSL https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.sh | bash"
security: unverified
security_checked_at: null
triggers: ["talk like caveman"]
pros:
  - חיסכון ממוצע של 65% בטוקנים של הפלט
  - תגובות מהירות יותר
  - הדיוק הטכני נשמר — משתנה סגנון הדיבור, לא היכולת
  - התקנה בשורה אחת, כ-30 שניות
  - ארבע רמות דחיסה — lite, full, ultra, wenyan
cons:
  - משפיע רק על טוקנים של הפלט, לא על טוקני החשיבה (reasoning) שגם הם כבדים
  - לא זמין בסביבות ישנות
when_not: not-found
prereq: not-found
cost_note: חינמי, רישיון MIT
next: not-found

provenance:
  install_cmd: { from: source, loc: "סעיף התקנה, פקודת מאק" }
  triggers:    { from: source, loc: "סעיף התקנה — הפעלה/עצירה" }
  security:    { from: source, loc: "לא נבדק — ברירת מחדל למקור חיצוני" }
  pros:        { from: source, loc: "רשימת יתרונות" }
  cons:        { from: source, loc: "רשימת חסרונות" }
  when_not:    { from: not-found, reason: "המדריך מציין מתי כן להשתמש, לא מתי להימנע" }
  prereq:      { from: not-found, reason: "המדריך לא מציין דרישות מוקדמות" }
  cost_note:   { from: source, loc: "רשימת יתרונות — חינמי עם רישיון MIT" }
---

## מה זה

סקיל שגורם לקלוד לדבר בקיצור — משפטים קצרים, בלי מילות מילוי. המוטו של הפרויקט: "למה להשתמש בטוקנים רבים כאשר מעטים עושים את העבודה?"

## ארבע רמות דחיסה

| רמה | מה משתנה |
|---|---|
| `lite` | הסרת מילות מילוי בלבד |
| `full` | ברירת המחדל |
| `ultra` | סגנון טלגרפי |
| `wenyan` | סינית קלאסית — הכי קצר |

## הפעלה ועצירה

הפעלה: `talk like caveman` · עצירה: `normal mode`
