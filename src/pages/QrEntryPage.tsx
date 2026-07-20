import symbol from '../assets/aedi-v-symbol.svg'
import wordmark from '../assets/aedi-v-wordmark.svg'
import styles from './QrEntryPage.module.css'

/**
 * Slide 16:9 - 36 (Figma node 3891:118010) — the QR entry screen an agency
 * scans to start the pilot signup. The QR image itself is omitted; the card
 * renders an empty slot at the original dimensions in its place.
 */
export default function QrEntryPage() {
  return (
    <main className={styles.page}>
      <div className={styles.group}>
        <div className={styles.logo}>
          <img className={styles.logoSymbol} src={symbol} alt="" />
          <img className={styles.logoWordmark} src={wordmark} alt="aedi-v" />
        </div>

        <div className={styles.qrCard}>
          <div className={styles.qrSlot}>QR</div>
        </div>

        <p className={styles.notice}>
          This code expires at MIDNIGHT!
          <br />
          This code is valid only during this event!
        </p>
      </div>
    </main>
  )
}
