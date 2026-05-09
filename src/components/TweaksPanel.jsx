import { useState } from 'react'
import { Ic } from '../lib/icons.jsx'

const STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:56px;z-index:2000;width:260px;
    background:rgba(250,249,247,.92);color:#29261b;
    -webkit-backdrop-filter:blur(20px) saturate(140%);backdrop-filter:blur(20px) saturate(140%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.4) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:pointer;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px}
  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:8px 0 0}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-field{appearance:none;width:100%;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px}
  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s,width .15s}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:pointer;padding:4px 6px;line-height:1.2}
  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:pointer;padding:0;flex-shrink:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s;display:block}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}
  .twk-gear-btn{position:fixed;right:16px;bottom:16px;z-index:1999;
    width:36px;height:36px;border-radius:50%;border:1px solid var(--line);
    background:var(--surface);color:var(--ink2);cursor:pointer;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 2px 8px rgba(0,0,0,.12);transition:background .15s}
  .twk-gear-btn:hover{background:var(--surface2)}
`

function TweakSection({ title, children }) {
  return (
    <>
      <div className="twk-sect">{title}</div>
      {children}
    </>
  )
}

function TweakRadio({ label, value, options, onChange }) {
  const n = options.length
  const idx = Math.max(0, options.findIndex(o => o.value === value))
  return (
    <div className="twk-row">
      <div className="twk-lbl"><span>{label}</span></div>
      <div className="twk-seg">
        <div className="twk-seg-thumb" style={{
          left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
          width: `calc((100% - 4px) / ${n})`
        }} />
        {options.map(o => (
          <button key={o.value} type="button" onClick={() => onChange(o.value)}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function TweakSelect({ label, value, options, onChange }) {
  return (
    <div className="twk-row">
      <div className="twk-lbl"><span>{label}</span></div>
      <select className="twk-field" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

function TweakToggle({ label, value, onChange }) {
  return (
    <div className="twk-row twk-row-h">
      <div className="twk-lbl"><span>{label}</span></div>
      <button type="button" className="twk-toggle" data-on={value ? '1' : '0'}
        onClick={() => onChange(!value)}><i /></button>
    </div>
  )
}

export default function TweaksPanel({ tweaks, setTweak }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <style>{STYLE}</style>
      <button className="twk-gear-btn" onClick={() => setOpen(o => !o)} aria-label="הגדרות עיצוב" title="ערוך עיצוב">
        <Ic.gear />
      </button>
      {open && (
        <div className="twk-panel">
          <div className="twk-hd">
            <b>עיצוב</b>
            <button className="twk-x" onClick={() => setOpen(false)} aria-label="סגור הגדרות">✕</button>
          </div>
          <div className="twk-body">
            <TweakSection title="סגנון">
              <TweakRadio
                label="וריאציה"
                value={tweaks.variant}
                onChange={v => setTweak('variant', v)}
                options={[{ value: 'calm', label: 'שמרני' }, { value: 'bold', label: 'נועז' }]}
              />
            </TweakSection>
            <TweakSection title="צבע">
              <TweakSelect
                label="אקסנט"
                value={tweaks.accent}
                onChange={v => setTweak('accent', v)}
                options={[
                  { value: 'lime', label: 'ליים' },
                  { value: 'fuchsia', label: 'פוקסיה' },
                  { value: 'lilac', label: 'לילך' },
                  { value: 'duo', label: 'ליים + פוקסיה' },
                ]}
              />
            </TweakSection>
            <TweakSection title="צפיפות">
              <TweakRadio
                label="גריד"
                value={tweaks.density}
                onChange={v => setTweak('density', v)}
                options={[{ value: 'comfy', label: 'נוח' }, { value: 'compact', label: 'דחוס' }]}
              />
            </TweakSection>
          </div>
        </div>
      )}
    </>
  )
}
