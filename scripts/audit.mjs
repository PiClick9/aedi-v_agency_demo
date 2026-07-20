/**
 * Design QA harness — renders the running dev server at several viewports,
 * measures every element against the Figma spec, and reports drift.
 *
 *   npm run dev                        # in another terminal
 *   npm run audit:design -- ./shots    # screenshot dir is optional
 *
 * Desktop viewports are checked against exact Figma pixel values. Mobile
 * viewports intentionally reflow, so there we assert the invariants that must
 * survive the reflow (no horizontal overflow, legible type, centred axis).
 */
import { chromium } from 'playwright'

const OUT = process.argv[2]
const BASE = process.env.AUDIT_URL ?? 'http://localhost:5173'

const TOL = 0.75 // px
let failures = 0
let checks = 0

const near = (label, actual, expected, tol = TOL) => {
  checks++
  const ok = Math.abs(actual - expected) <= tol
  if (!ok) failures++
  console.log(
    `${ok ? 'OK  ' : 'FAIL'} ${label}: ${actual.toFixed(2)} (expected ${expected.toFixed(2)})`,
  )
}

const eq = (label, actual, expected) => {
  checks++
  const ok = actual === expected
  if (!ok) failures++
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${label}: ${actual}${ok ? '' : ` (expected ${expected})`}`)
}

const ok = (label, condition, detail = '') => {
  checks++
  if (!condition) failures++
  console.log(`${condition ? 'OK  ' : 'FAIL'} ${label}${detail ? `: ${detail}` : ''}`)
}

/** Serialised in the browser: measure by CSS-Module class-name fragment. */
const probe = () => {
  const q = (name) => document.querySelector(`[class*="${name}"]`)
  const qa = (name) => [...document.querySelectorAll(`[class*="${name}"]`)]
  const box = (el) => {
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { x: r.x, y: r.y, w: r.width, h: r.height }
  }
  const type = (el) => {
    if (!el) return null
    const s = getComputedStyle(el)
    return {
      size: parseFloat(s.fontSize),
      lh: parseFloat(s.lineHeight),
      weight: s.fontWeight,
      color: s.color,
      family: s.fontFamily.split(',')[0].replace(/["']/g, ''),
    }
  }
  const inputEl = q('input')
  const submitEl = q('submit')
  // `[class*=]` is case-sensitive, so the QR screen's `qrCard` needs its own probe.
  const cardEl = q('card') ?? q('qrCard')
  const is = inputEl && getComputedStyle(inputEl)
  const ss = submitEl && getComputedStyle(submitEl)
  const cs = cardEl && getComputedStyle(cardEl)

  return {
    logo: box(q('logo')),
    symbol: box(q('logoSymbol')),
    wordmark: box(q('logoWordmark')),
    card: box(cardEl),
    title: box(q('title')),
    titleType: type(q('title')),
    fields: box(q('fields')),
    fieldBoxes: qa('field').filter((el) => !el.className.includes('fields')).map(box),
    labelType: type(q('label')),
    labels: qa('label').map(box),
    inputs: qa('input').map(box),
    inputType: type(inputEl),
    inputStyle: is && {
      border: is.borderTopWidth,
      borderColor: is.borderTopColor,
      radius: is.borderTopLeftRadius,
      padX: is.paddingLeft,
      bg: is.backgroundColor,
    },
    submit: box(submitEl),
    submitType: type(submitEl),
    submitStyle: ss && { bg: ss.backgroundColor, radius: ss.borderTopLeftRadius },
    cardStyle: cs && {
      bg: cs.backgroundColor,
      radius: cs.borderTopLeftRadius,
      padY: cs.paddingTop,
      padX: cs.paddingLeft,
      shadow: cs.boxShadow,
    },
    placeholderColor: (() => {
      // Placeholder colour is not exposed on computed style; read the rule.
      for (const sheet of document.styleSheets) {
        let rules
        try {
          rules = sheet.cssRules
        } catch {
          continue
        }
        for (const rule of rules ?? []) {
          if (rule.selectorText?.includes('::placeholder')) return rule.style.color
        }
      }
      return null
    })(),
    pageBg: getComputedStyle(document.body).backgroundColor,
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
    scrollH: document.documentElement.scrollHeight,
    clientH: document.documentElement.clientHeight,
  }
}

/* ---------------------------------------------------------------- specs -- */

/** "가입하기" — Figma node 3910:20692 / card 3910:20693. */
const signupSpec = (m, vp) => {
  const cx = (b) => b.x + b.w / 2
  const mid = vp.width / 2

  console.log('-- logo')
  near('logo w', m.logo.w, 259)
  near('logo h', m.logo.h, 60)
  near('symbol', m.symbol.w, 60)
  near('symbol h', m.symbol.h, 60)
  near('wordmark w', m.wordmark.w, 181)
  near('wordmark h', m.wordmark.h, 46.41)
  near('logo centre x', cx(m.logo), mid, 1)

  console.log('-- card')
  near('card w', m.card.w, 667)
  near('card h', m.card.h, 634)
  near('card centre x', cx(m.card), mid, 1)
  near('card radius', parseFloat(m.cardStyle.radius), 10)
  near('card pad-y', parseFloat(m.cardStyle.padY), 44)
  near('card pad-x', parseFloat(m.cardStyle.padX), 36)
  eq('card bg', m.cardStyle.bg, 'rgb(255, 255, 255)')
  eq('card shadow', m.cardStyle.shadow, 'rgba(0, 0, 0, 0.1) 0px 0px 16px 0px')
  near('gap logo->card', m.card.y - (m.logo.y + m.logo.h), 48)

  console.log('-- title')
  near('title h', m.title.h, 42, 1)
  near('title font-size', m.titleType.size, 32)
  near('title line-height', m.titleType.lh, 41.6, 1)
  eq('title weight', m.titleType.weight, '700')
  eq('title colour', m.titleType.color, 'rgb(0, 0, 0)')
  near('title centre x', cx(m.title), mid, 1)
  near('title y (from card top)', m.title.y - m.card.y, 44)

  console.log('-- fields')
  near('fields w', m.fields.w, 595)
  near('fields h', m.fields.h, 392)
  near('fields y (from card top)', m.fields.y - m.card.y, 122)
  ok('field count', m.fieldBoxes.length === 4, `${m.fieldBoxes.length}`)
  m.fieldBoxes.forEach((f, i) => near(`field ${i} h`, f.h, 80))
  for (let i = 1; i < m.fieldBoxes.length; i++) {
    const gap = m.fieldBoxes[i].y - (m.fieldBoxes[i - 1].y + m.fieldBoxes[i - 1].h)
    near(`field gap ${i - 1}->${i}`, gap, 24)
  }
  near('label h', m.labels[0].h, 24)
  near('label font-size', m.labelType.size, 16)
  eq('label weight', m.labelType.weight, '400')
  eq('label colour', m.labelType.color, 'rgb(26, 26, 26)')
  near('label->input gap', m.inputs[0].y - (m.labels[0].y + m.labels[0].h), 8)

  console.log('-- input')
  near('input h', m.inputs[0].h, 48)
  near('input w', m.inputs[0].w, 595)
  near('input font-size', m.inputType.size, 16)
  near('input border', parseFloat(m.inputStyle.border), 1)
  eq('input border colour', m.inputStyle.borderColor, 'rgb(228, 231, 234)')
  near('input radius', parseFloat(m.inputStyle.radius), 5)
  near('input pad-x', parseFloat(m.inputStyle.padX), 16)
  eq('input bg', m.inputStyle.bg, 'rgb(255, 255, 255)')
  eq('placeholder colour', m.placeholderColor, 'var(--color-text-disabled)')

  console.log('-- button')
  near('button w', m.submit.w, 118)
  near('button h', m.submit.h, 40)
  near('button centre x', cx(m.submit), mid, 1)
  near('button y (from card top)', m.submit.y - m.card.y, 550)
  near('button font-size', m.submitType.size, 14)
  eq('button weight', m.submitType.weight, '500')
  eq('button colour', m.submitType.color, 'rgb(255, 255, 255)')
  eq('button bg', m.submitStyle.bg, 'rgb(26, 26, 26)')
  ok('button radius pill', parseFloat(m.submitStyle.radius) >= 20, m.submitStyle.radius)

  console.log('-- page')
  eq('page bg', m.pageBg, 'rgb(247, 248, 250)')
  eq('font family', m.titleType.family, 'Pretendard')
}

/** QR entry — Figma node 3891:118010. */
const qrSpec = (m, vp, scale) => {
  const cx = (b) => b.x + b.w / 2
  const mid = vp.width / 2
  const s = scale
  near('logo w', m.logo.w, 259 * s)
  near('logo h', m.logo.h, 60 * s)
  near('wordmark w', m.wordmark.w, 181 * s)
  near('card w', m.card.w, 220 * s)
  near('card h', m.card.h, 220 * s)
  near('card centre x', cx(m.card), mid, 1)
  near('card centre y', m.card.y + m.card.h / 2, vp.height / 2, 1.5)
  eq('page bg', m.pageBg, 'rgb(247, 248, 250)')
}

/** Invariants that must hold after any responsive reflow. */
const responsiveSpec = (m, vp) => {
  const cx = (b) => b.x + b.w / 2
  const mid = vp.width / 2
  ok('no horizontal overflow', m.scrollW <= m.clientW, `${m.scrollW} <= ${m.clientW}`)
  ok('card within viewport', m.card.x >= 0 && m.card.x + m.card.w <= vp.width, `x=${m.card.x.toFixed(1)} w=${m.card.w.toFixed(1)}`)
  near('card centre x', cx(m.card), mid, 1)
  near('logo centre x', cx(m.logo), mid, 1)
  ok('input type >= 16px (no iOS zoom)', m.inputType.size >= 16, `${m.inputType.size}px`)
  ok('label type >= 14px', m.labelType.size >= 14, `${m.labelType.size}px`)
  ok('title type >= 20px', m.titleType.size >= 20, `${m.titleType.size}px`)
  near('input h', m.inputs[0].h, 48)
  ok('button tap target >= 40px', m.submit.h >= 40, `${m.submit.h}px`)
  m.inputs.forEach((el, i) =>
    ok(`input ${i} inside card`, el.x >= m.card.x && el.x + el.w <= m.card.x + m.card.w),
  )
  eq('page bg', m.pageBg, 'rgb(247, 248, 250)')
}

/* ------------------------------------------------------------------ run -- */

const RUNS = [
  { route: '/', name: 'signup-1920x1080', width: 1920, height: 1080, spec: signupSpec },
  { route: '/', name: 'signup-1440x900', width: 1440, height: 900, spec: signupSpec },
  { route: '/', name: 'signup-1024x900', width: 1024, height: 900, spec: signupSpec },
  { route: '/', name: 'signup-768x1024', width: 768, height: 1024, spec: signupSpec },
  { route: '/', name: 'signup-767x1024', width: 767, height: 1024, spec: responsiveSpec },
  { route: '/', name: 'signup-390x844', width: 390, height: 844, spec: responsiveSpec },
  { route: '/', name: 'signup-360x640', width: 360, height: 640, spec: responsiveSpec },
  { route: '/', name: 'signup-320x568', width: 320, height: 568, spec: responsiveSpec },
  { route: '/qr', name: 'qr-1920x1080', width: 1920, height: 1080, spec: (m, vp) => qrSpec(m, vp, 1) },
  { route: '/qr', name: 'qr-390x844', width: 390, height: 844, spec: (m, vp) => qrSpec(m, vp, 0.85) },
]

const browser = await chromium.launch()

for (const run of RUNS) {
  const page = await browser.newPage({ viewport: { width: run.width, height: run.height } })
  await page.goto(`${BASE}/#${run.route}`, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(300)
  if (OUT) await page.screenshot({ path: `${OUT}/${run.name}.png`, fullPage: true })

  const m = await page.evaluate(probe)
  console.log(`\n===== ${run.name} =====`)
  run.spec(m, run)

  const oY = m.scrollH > m.clientH
  console.log(`${oY ? 'note' : 'OK  '} vertical scroll: ${oY ? `${m.scrollH} > ${m.clientH}` : 'none'}`)

  await page.close()
}

await browser.close()
console.log(
  `\n${checks} checks — ${failures === 0 ? 'PASS, no drift from spec' : `${failures} FAILURE(S)`}`,
)
process.exit(failures === 0 ? 0 : 1)
