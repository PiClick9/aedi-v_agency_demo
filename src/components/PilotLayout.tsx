import type { ReactNode } from 'react'
import symbol from '../assets/aedi-v-symbol.svg'
import wordmark from '../assets/aedi-v-wordmark.svg'
import styles from './PilotLayout.module.css'

/** Logo header and card slot shared by the agency pilot screens. */
export default function PilotLayout({ children }: { children: ReactNode }) {
  return (
    <main className={styles.page}>
      <div className={styles.logo}>
        <img className={styles.logoSymbol} src={symbol} alt="" />
        <img className={styles.logoWordmark} src={wordmark} alt="aedi-v" />
      </div>
      <div className={styles.slot}>{children}</div>
    </main>
  )
}
