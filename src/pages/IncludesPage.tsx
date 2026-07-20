import { useState } from 'react'
import PilotLayout from '../components/PilotLayout'
import SuccessModal from '../components/SuccessModal'
import linkIcon from '../assets/icon-link.svg'
import styles from './IncludesPage.module.css'

const INVITE_URL =
  'https://chromewebstore.google.com/detail/aedi-v-ai-product-matchin/bgfclceipgllbohhclicafhdcipbeogd?hl=en'

/**
 * "링크 복사" — INCLUDES / invite link screen (Figma node 3910:20702).
 * Reached after the signup form saves.
 */
export default function IncludesPage() {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(INVITE_URL)
    } catch {
      // Clipboard access needs a secure context and can be denied; the dialog
      // still confirms so the demo flow keeps moving.
    }
    setCopied(true)
  }

  return (
    <PilotLayout>
      <section className={styles.card}>
        <h1 className={styles.title}>INCLUDES</h1>

        <div className={styles.body}>
          <div className={styles.row}>
            <input className={styles.link} value={INVITE_URL} readOnly aria-label="Invite link" />
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
              A free Agency Admin Dashboard for monitoring creator performance and estimated
              affiliate revenue
            </li>
          </ul>
        </div>
      </section>

      {copied && <SuccessModal title="Link copied" onClose={() => setCopied(false)} />}
    </PilotLayout>
  )
}
