/**
 * Design QA harness — renders the running dev server at several viewports,
 * measures every element against the Figma spec, and reports drift.
 *
 *   npm run dev            # in another terminal
 *   npm run audit -- <output-dir-for-screenshots>
 */
import { chromium } from 'playwright'

const OUT = process.argv[2]
const URL = process.env.AUDIT_URL ?? 'http://localhost:5173/'

const VIEWPORTS = [
  { name: '1920x1080', width: 1920, height: 1080, scale: 1 },
  { name: '1440x900', width: 1440, height: 900, scale: 1 },
  { name: '768x1024', width: 768, height: 1024, scale: 1 },
  { name: '390x844', width: 390, height: 844, scale: 0.85 },
  { name: '360x640', width: 360, height: 640, scale: 0.72 },
]

/** Figma node 3891:118010, measured on the 1920x1080 artboard. */
const SPEC = {
  logo: { w: 259, h: 60 },
  symbol: { w: 60, h: 60 },
  wordmark: { w: 181, h: 46.41 },
  card: { w: 220, h: 220 },
  slot: { w: 204.784, h: 204.784 },
  gapLogoToCard: 74,
  gapCardToNotice: 44,
  fontSize: 18,
  lineHeight: 27,
}

const TOL = 0.75 // px
let failures = 0

const check = (label, actual, expected, tol = TOL) => {
  const ok = Math.abs(actual - expected) <= tol
  if (!ok) failures++
  return `${ok ? 'OK  ' : 'FAIL'} ${label}: ${actual.toFixed(2)} (expected ${expected.toFixed(2)})`
}

const browser = await chromium.launch()

for (const vp of VIEWPORTS) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } })
  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(300)
  if (OUT) await page.screenshot({ path: `${OUT}/${vp.name}.png` })

  const m = await page.evaluate(() => {
    // CSS Modules keeps the source class name inside the generated hash.
    const q = (name) => document.querySelector(`[class*="${name}"]`)
    const box = (el) => {
      const r = el.getBoundingClientRect()
      return { x: r.x, y: r.y, w: r.width, h: r.height }
    }
    const notice = q('notice')
    const card = q('qrCard')
    const ns = getComputedStyle(notice)
    const cs = getComputedStyle(card)
    return {
      scale: parseFloat(getComputedStyle(q('page')).getPropertyValue('--scale')),
      logo: box(q('logo')),
      symbol: box(q('logoSymbol')),
      wordmark: box(q('logoWordmark')),
      card: box(card),
      slot: box(q('qrSlot')),
      notice: box(notice),
      font: {
        size: parseFloat(ns.fontSize),
        lh: parseFloat(ns.lineHeight),
        weight: ns.fontWeight,
        color: ns.color,
        family: ns.fontFamily.split(',')[0].replace(/["']/g, ''),
      },
      cardStyle: { bg: cs.backgroundColor, radius: cs.borderTopLeftRadius, pad: cs.paddingTop },
      pageBg: getComputedStyle(document.body).backgroundColor,
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
      scrollH: document.documentElement.scrollHeight,
      clientH: document.documentElement.clientHeight,
    }
  })

  const s = vp.scale
  const cx = (b) => b.x + b.w / 2
  console.log(`\n===== ${vp.name} =====`)
  console.log(check('--scale', m.scale, s, 0.001))
  console.log(check('logo w', m.logo.w, SPEC.logo.w * s))
  console.log(check('logo h', m.logo.h, SPEC.logo.h * s))
  console.log(check('symbol w', m.symbol.w, SPEC.symbol.w * s))
  console.log(check('symbol h', m.symbol.h, SPEC.symbol.h * s))
  console.log(check('wordmark w', m.wordmark.w, SPEC.wordmark.w * s))
  console.log(check('wordmark h', m.wordmark.h, SPEC.wordmark.h * s))
  console.log(check('card w', m.card.w, SPEC.card.w * s))
  console.log(check('card h', m.card.h, SPEC.card.h * s))
  console.log(check('slot w', m.slot.w, SPEC.slot.w * s))
  console.log(check('slot h', m.slot.h, SPEC.slot.h * s))
  console.log(check('card padding', parseFloat(m.cardStyle.pad), 7.608 * s))
  console.log(check('card radius', parseFloat(m.cardStyle.radius), 6.34 * s))
  console.log(check('gap logo->card', m.card.y - (m.logo.y + m.logo.h), SPEC.gapLogoToCard * s))
  console.log(check('gap card->notice', m.notice.y - (m.card.y + m.card.h), SPEC.gapCardToNotice * s))
  console.log(check('font-size', m.font.size, SPEC.fontSize * s))
  console.log(check('line-height', m.font.lh, SPEC.lineHeight * s))
  // All three elements share the artboard's centre axis.
  console.log(check('logo centre x', cx(m.logo), vp.width / 2, 1))
  console.log(check('card centre x', cx(m.card), vp.width / 2, 1))
  console.log(check('notice centre x', cx(m.notice), vp.width / 2, 1))
  // The QR card sits exactly on the artboard's vertical centre.
  console.log(check('card centre y', m.card.y + m.card.h / 2, vp.height / 2, 1.5))

  const tokens = [
    ['page bg', m.pageBg, 'rgb(247, 248, 250)'],
    ['card bg', m.cardStyle.bg, 'rgb(255, 255, 255)'],
    ['text color', m.font.color, 'rgb(26, 26, 26)'],
    ['font weight', m.font.weight, '500'],
    ['font family', m.font.family, 'Pretendard'],
  ]
  for (const [label, actual, expected] of tokens) {
    const ok = actual === expected
    if (!ok) failures++
    console.log(`${ok ? 'OK  ' : 'FAIL'} ${label}: ${actual}${ok ? '' : ` (expected ${expected})`}`)
  }

  const oX = m.scrollW > m.clientW
  const oY = m.scrollH > m.clientH
  if (oX) failures++
  console.log(`${oX ? 'FAIL' : 'OK  '} overflow-x: ${oX ? `${m.scrollW} > ${m.clientW}` : 'none'}`)
  console.log(`${oY ? 'WARN' : 'OK  '} overflow-y: ${oY ? `${m.scrollH} > ${m.clientH}` : 'none'}`)

  await page.close()
}

await browser.close()
console.log(`\n${failures === 0 ? 'PASS — no drift from spec' : `${failures} FAILURE(S)`}`)
process.exit(failures === 0 ? 0 : 1)
