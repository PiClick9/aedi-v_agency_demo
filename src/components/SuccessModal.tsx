import { useEffect, useRef } from 'react'
import styles from './SuccessModal.module.css'

type Props = {
  title: string
  confirmLabel?: string
  onClose: () => void
}

/**
 * "완료" success dialog (Figma node 3910:22043, modal 3910:22086).
 * Shown once the AGENCY PILOT form saves.
 */
export default function SuccessModal({ title, confirmLabel = 'OK', onClose }: Props) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    confirmRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)

    // Keep the page behind the scrim from scrolling.
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflow
    }
  }, [onClose])

  return (
    <div className={styles.scrim} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <p className={styles.title} id="success-modal-title">
          {title}
        </p>
        <button className={styles.confirm} type="button" onClick={onClose} ref={confirmRef}>
          {confirmLabel}
        </button>
      </div>
    </div>
  )
}
