import { useRef, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import PilotLayout from '../components/PilotLayout'
import SuccessModal from '../components/SuccessModal'
import linkIcon from '../assets/icon-link.svg'
import styles from './IncludesPage.module.css'

/**
 * Copy `text` to the clipboard, returning whether it actually landed there.
 *
 * The async Clipboard API is the happy path, but it's undefined outside secure
 * contexts (plain-http / LAN-IP) and is frequently blocked in the mobile in-app
 * webviews people reach this QR flow from. When it's missing or rejects, fall
 * back to selecting a hidden field and running the legacy execCommand, which
 * those environments still honour. Only a real success is reported so the
 * "Link copied" confirmation can never lie.
 */
async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Fall through to the legacy path below.
    }
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.top = '0'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  textarea.setSelectionRange(0, text.length) // iOS ignores select() alone
  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch {
    ok = false
  }
  document.body.removeChild(textarea)
  return ok
}

/**
 * "링크 복사" — INCLUDES / invite link screen (Figma node 3910:20702).
 * Reached after the signup form registers; the invite link comes from the API
 * response via router state.
 */
export default function IncludesPage() {
  const location = useLocation()
  const inviteUrl = (location.state as { link?: string } | null)?.link
  const [copied, setCopied] = useState(false)
  const linkRef = useRef<HTMLInputElement>(null)

  // No link means a direct visit or a refresh (HashRouter drops state) — you
  // can't have an invite link without registering, so send them to the form.
  if (!inviteUrl) return <Navigate to="/" replace />

  const handleCopy = async () => {
    if (await copyToClipboard(inviteUrl)) {
      setCopied(true)
      return
    }
    // Copy is genuinely unavailable here — don't claim success. Select the
    // visible link so the user can copy it by hand.
    linkRef.current?.focus()
    linkRef.current?.select()
  }

  return (
    <PilotLayout>
      <section className={styles.card}>
        <h1 className={styles.title}>INCLUDES</h1>

        <div className={styles.body}>
          <div className={styles.row}>
            <input
              ref={linkRef}
              className={styles.link}
              value={inviteUrl}
              readOnly
              aria-label="Invite link"
            />
            <button className={styles.copy} type="button" onClick={handleCopy}>
              <span className={styles.copyIcon}>
                <img src={linkIcon} alt="" />
              </span>
              Copy link
            </button>
          </div>

          <ul className={styles.list}>
            <li>
              Free Standard Plan credits for up to <span className={styles.strong}>20 creators</span>
            </li>
            <li>One month of access</li>
            <li>One hour of AI video analysis credits per creator</li>
            <li>
              A free Agency Admin Dashboard for monitoring creator usage and agency revenue
            </li>
          </ul>
        </div>
      </section>

      {copied && <SuccessModal title="Link copied" onClose={() => setCopied(false)} />}
    </PilotLayout>
  )
}
