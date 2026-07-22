/**
 * Verifies the signup → registration API flow with a mocked endpoint (the real
 * one is CORS-blocked and creates registrations). Run against the dev server:
 *   npm run dev
 *   node scripts/api-flow.mjs
 */
import { chromium } from 'playwright'

const BASE = process.env.AUDIT_URL ?? 'http://localhost:5173'
const ENDPOINT = 'https://global.aedi.ai/aediv/simple_registration'
const LINK = 'https://chromewebstore.google.com/detail/aedi-v/bgfclceipgllbohhclicafhdcipbeogd?registCode=abc123'

let failures = 0
const ok = (label, cond, detail = '') => {
  if (!cond) failures++
  console.log(`${cond ? 'OK  ' : 'FAIL'} ${label}${detail ? `: ${detail}` : ''}`)
}

const browser = await chromium.launch()

const fill = async (page) => {
  await page.fill('#company', 'MCN Test')
  await page.fill('#name', 'test')
  await page.fill('#email', 'test@test.com')
  // position left blank on purpose
}

/* 1) Success: request shape + link carried to INCLUDES ------------------- */
{
  const page = await browser.newPage()
  await page.goto(`${BASE}/#/`, { waitUntil: 'networkidle' })

  let captured = null
  await page.route(ENDPOINT, async (route) => {
    const req = route.request()
    captured = { method: req.method(), url: req.url(), body: req.postDataJSON(), ctype: req.headers()['content-type'] }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'S', msg: 'Success', u_idx: 7044, link: LINK }),
    })
  })

  await fill(page)
  await page.click('[class*="submit"]')
  await page.waitForSelector('[class*="modal"]', { timeout: 3000 })

  console.log('\n== success ==')
  ok('POST method', captured?.method === 'POST', captured?.method)
  ok('correct endpoint', captured?.url === ENDPOINT, captured?.url)
  ok('content-type is JSON', (captured?.ctype ?? '').includes('application/json'), captured?.ctype)
  ok('body maps company→bizName', captured?.body?.bizName === 'MCN Test', JSON.stringify(captured?.body))
  ok('body maps name', captured?.body?.name === 'test')
  ok('body maps email', captured?.body?.email === 'test@test.com')
  ok('blank position sent as ""', captured?.body?.position === '', JSON.stringify(captured?.body?.position))
  ok('success dialog shows "Saved successfully"', (await page.locator('[class*="modal"]').textContent())?.includes('Saved successfully'))

  await page.click('[class*="confirm"]')
  await page.waitForTimeout(300)
  ok('navigated to /includes', new URL(page.url()).hash === '#/includes', page.url())
  const shownLink = await page.inputValue('input[aria-label="Invite link"]')
  ok('INCLUDES shows the returned link', shownLink === LINK, shownLink)
  await page.close()
}

/* 2) Failure (status != "S"): error modal, stays on form ----------------- */
{
  const page = await browser.newPage()
  await page.goto(`${BASE}/#/`, { waitUntil: 'networkidle' })
  await page.route(ENDPOINT, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'E', msg: 'Email already registered' }) }),
  )
  await fill(page)
  await page.click('[class*="submit"]')
  await page.waitForSelector('[class*="modal"]', { timeout: 3000 })

  console.log('\n== failure (status E) ==')
  ok('shows server message', (await page.locator('[class*="modal"]').textContent())?.includes('Email already registered'))
  await page.click('[class*="confirm"]')
  await page.waitForTimeout(200)
  ok('stays on the form', new URL(page.url()).hash === '#/', page.url())
  ok('no modal after OK', (await page.locator('[class*="modal"]').count()) === 0)
  await page.close()
}

/* 3) Network/CORS failure: generic error --------------------------------- */
{
  const page = await browser.newPage()
  await page.goto(`${BASE}/#/`, { waitUntil: 'networkidle' })
  await page.route(ENDPOINT, (route) => route.abort())
  await fill(page)
  await page.click('[class*="submit"]')
  await page.waitForSelector('[class*="modal"]', { timeout: 3000 })

  console.log('\n== failure (network) ==')
  ok('shows the default error', (await page.locator('[class*="modal"]').textContent())?.includes('Registration failed'))
  await page.close()
}

/* 4) Direct visit to /includes with no link → redirect to form ----------- */
{
  const page = await browser.newPage()
  await page.goto(`${BASE}/#/includes`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(200)
  console.log('\n== includes direct visit ==')
  ok('redirects to the form', new URL(page.url()).hash === '#/', page.url())
  await page.close()
}

await browser.close()
console.log(`\n${failures === 0 ? 'PASS — API flow verified' : `${failures} FAILURE(S)`}`)
process.exit(failures === 0 ? 0 : 1)
