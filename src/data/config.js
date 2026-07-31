export const CAT_LABELS = {
  post:'פוסטים', agency:'סוכנות AI', dev:'פיתוח', docs:'מסמכים',
  build:'בנייה', automation:'אוטומציה', telegram:'טלגרם',
  hookify:'Hookify', plugins:'פלאגינים', mcp:'MCP'
};

export const CAT_COLORS = {
  post:'#c5f206', agency:'#f97316', dev:'#60a5fa', docs:'#a78bfa',
  build:'#34d399', automation:'#f472b6', telegram:'#22d3ee',
  hookify:'#fbbf24', plugins:'#e879f9', mcp:'#94a3b8'
};

export const CAT_ORDER = ['post','agency','dev','docs','build','automation','telegram','hookify','plugins','mcp'];

export const UC_LABELS = {
  content:'תוכן', design:'עיצוב', web:'אתרים', slides:'מצגות',
  automation:'אוטומציה', qa:'בדיקות', analysis:'ניתוח', dev:'פיתוח'
};

export const UC_ORDER = ['content','design','web','slides','automation','qa','analysis','dev'];

const OFFICIAL = 'https://github.com/anthropics/claude-plugins-official'
export const SOURCES = {
  'hookify@official':          { label: 'hookify', cmd: 'claude plugins install hookify@claude-plugins-official', url: OFFICIAL },
  'commit-commands@official':  { label: 'commit-commands', cmd: 'claude plugins install commit-commands@claude-plugins-official', url: OFFICIAL },
  'code-review@official':      { label: 'code-review', cmd: 'claude plugins install code-review@claude-plugins-official', url: OFFICIAL },
  'pr-review-toolkit@official':{ label: 'pr-review-toolkit', cmd: 'claude plugins install pr-review-toolkit@claude-plugins-official', url: OFFICIAL },
  'feature-dev@official':      { label: 'feature-dev', cmd: 'claude plugins install feature-dev@claude-plugins-official', url: OFFICIAL },
  'plugin-dev@official':       { label: 'plugin-dev', cmd: 'claude plugins install plugin-dev@claude-plugins-official', url: OFFICIAL },
  'agent-sdk-dev@official':    { label: 'agent-sdk-dev', cmd: 'claude plugins install agent-sdk-dev@claude-plugins-official', url: OFFICIAL },
  'frontend-design@official':  { label: 'frontend-design', cmd: 'claude plugins install frontend-design@claude-plugins-official', url: OFFICIAL },
  'vercel@official':           { label: 'vercel', cmd: 'claude plugins install vercel@claude-plugins-official', url: OFFICIAL },
  'supabase@official':         { label: 'supabase', cmd: 'claude plugins install supabase@claude-plugins-official', url: OFFICIAL },
  'telegram@official':         { label: 'telegram', cmd: 'claude plugins install telegram@claude-plugins-official', url: OFFICIAL },
  'marketing-skills':          { label: 'marketing-skills', cmd: 'claude plugins install marketing-skills@marketingskills', url: 'https://github.com/coreyhaines31/marketingskills' },
  'ponytail':                  { label: 'ponytail', cmd: 'claude plugins install ponytail@ponytail', url: 'https://github.com/DietrichGebert/ponytail' },
  'mcp-connector':             { label: 'MCP Connector', cmd: null, url: 'https://claude.ai' },
}

// ── מרכז הידע ───────────────────────────────────────────────────────────

export const TYPE_LABELS = {
  guide:  'מדריך',
  prompt: 'פרומפט',
  skill:  'סקיל',
  mcp:    'MCP',
}

export const TYPE_COLORS = {
  guide:  '#a78bfa',
  prompt: '#34d399',
  skill:  '#c5f206',
  mcp:    '#94a3b8',
}

export const TAG_LABELS = {
  cowork: 'Cowork', 'claude-code': 'קלוד קוד', prompts: 'פרומפטים',
  security: 'אבטחה', marketing: 'שיווק', content: 'תוכן',
  automation: 'אוטומציה', models: 'מודלים', mcp: 'MCP',
  agents: 'סוכנים', design: 'עיצוב', tokens: 'טוקנים',
  workflows: 'שגרות עבודה', hebrew: 'עברית',
}

export const INSTALL_STATE_LABELS = {
  installed: 'מותקן',
  collected: 'אספתי, לא התקנתי',
  reference: 'מידע בלבד',
}

export const SECURITY_LABELS = {
  unverified: 'לא נבדק',
  verified:   'נבדק',
  rejected:   'נדחה',
}

/** הבקשה שמועתקת בלחיצה על סקיל שלא נבדק — הפייפליין לא מריץ התקנות */
export const securityCheckPrompt = (item) =>
  `הרץ security-check על הסקיל "${item.title}".\n` +
  `מקור: ${item.raw?.source_url || 'לא צוין'}\n` +
  `פקודת ההתקנה שנשמרה כטקסט:\n${item.raw?.install_cmd || ''}\n\n` +
  `אל תתקין כלום לפני שתציג לי את הממצאים ואאשר.`

// ── שערי משימה — עמוד הבית ──────────────────────────────────────────────
// פריט שמתאים לכמה שערים מופיע בכולם, ראה byTask ב-items.js. אין אריח
// "ללמוד" בכוונה — מסלולי לימוד כבר הכניסה למדריכים, ראה docs/PLAN.md

export const TASKS = {
  content:  { label: 'לכתוב תוכן',   uc: ['content'],            tags: ['content', 'prompts', 'marketing'] },
  build:    { label: 'לבנות',        uc: ['web', 'design', 'dev'], tags: ['design'] },
  automate: { label: 'לאוטומט',      uc: ['automation'],          tags: ['automation', 'workflows', 'agents', 'mcp'] },
  save:     { label: 'לחסוך טוקנים', uc: [],                      tags: ['tokens', 'models'] },
  install:  { label: 'להתקין',       uc: [],                      tags: [], state: 'collected' },
}

export const TASK_ORDER = ['content', 'build', 'automate', 'save', 'install']

export const PIPELINE_GROUPS = {
  content: { emoji:'📱', label:'תוכן ושיווק', desc:'פוסטים, מדריכים, ניתוח שוק, קהילה' },
  product: { emoji:'🛠️', label:'בניית מוצר', desc:'אתרים, כלי AI, מצגות' },
  ops:     { emoji:'⚙️', label:'תהליכי עבודה', desc:'קוד, אוטומציה, מחקר' }
};
