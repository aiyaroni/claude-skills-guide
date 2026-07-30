#!/bin/bash
#
# publish.sh — הריצה הלילית המלאה: קליטה → ולידציה → בנייה → פרסום.
#
# כל שלב חוסם את הבא. נכשל באמצע = לא נדחף כלום, התוכן מחכה ב-content/,
# ושורה FAILED נכנסת ליומן. שער הבנייה הוא מה שמונע דחיפת זבל לאוויר.
#
# הפרסום נעשה כאן, ב-shell, ולא על ידי המודל. ההרשאות של הריצה הלילית
# חוסמות git push בכוונה — מודל לא מפרסם לאוויר.

set -uo pipefail

cd "$(dirname "$0")/.." || exit 1
ROOT="$(pwd)"
STAMP="$(date '+%Y-%m-%d %H:%M')"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"

log()  { printf '%s | %s\n' "$STAMP" "$1" >> ingest-log.md; }
fail() {
  printf '%s | FAILED | %s\n' "$STAMP" "$1" >> ingest-log.md
  node scripts/dashboard.mjs >/dev/null 2>&1
  osascript -e "display notification \"$1\" with title \"מרכז הידע — הריצה נכשלה\"" 2>/dev/null
  echo "✗ $1" >&2
  exit 1
}

echo "── ריצה $STAMP ──"

# ── 1. קליטה ────────────────────────────────────────────────────────────
# פרופיל הרשאות נעול: בלי curl, בלי התקנות, בלי push, בלי כתיבה ל-src/
if [ -n "$(find inbox -maxdepth 1 -type f ! -name '.*' 2>/dev/null)" ]; then
  echo "→ קליטה"
  claude -p "/ingest" \
    --settings .claude/ingest-settings.json \
    >> ingest-log.md 2>&1 || fail "הקליטה נפלה — ראה ingest-log.md"
else
  echo "→ inbox ריק, מדלג על הקליטה"
  log "inbox ריק"
fi

# ── 2. ולידציה ובנייה ───────────────────────────────────────────────────
echo "→ ולידציה ובנייה"
BUILD_OUT="$(npm run build 2>&1)" || {
  echo "$BUILD_OUT" | tail -30 >> ingest-log.md
  fail "הבנייה נכשלה — התוכן לא נדחף ומחכה ב-content/"
}

# ── 3. דוחות ────────────────────────────────────────────────────────────
node scripts/gap-report.mjs >> ingest-log.md 2>&1
node scripts/dashboard.mjs || echo "⚠ הדשבורד לא נכתב"

# ── 4. פרסום ────────────────────────────────────────────────────────────
# רק אחרי ששני השלבים למעלה עברו
if [ -z "$(git status --porcelain content/ 2>/dev/null)" ]; then
  echo "→ אין תוכן חדש, לא מפרסם"
  log "אין שינוי בתוכן"
  exit 0
fi

COUNT=$(git status --porcelain content/ | wc -l | tr -d ' ')
echo "→ מפרסם $COUNT שינויים"

git add content/ processed/ ingest-log.md failures.md .claude/memory/ 2>/dev/null
git commit -q -m "content: קליטה אוטומטית $STAMP

$COUNT פריטים. הבנייה עברה לפני הפרסום.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" || fail "commit נכשל"

git push -q origin "$BRANCH" || fail "push נכשל — התוכן קומט מקומית ולא אבד"

log "פורסם — $COUNT פריטים"
osascript -e "display notification \"$COUNT פריטים נקלטו ופורסמו\" with title \"מרכז הידע\"" 2>/dev/null
echo "✓ הסתיים"
