import { useState, type FormEvent } from 'react'
import SuccessModal from '../components/SuccessModal'
import symbol from '../assets/aedi-v-symbol.svg'
import wordmark from '../assets/aedi-v-wordmark.svg'
import styles from './SignupPage.module.css'

// Position is optional — the design's filled state shows it empty with the
// success dialog open.
const FIELDS = [
  { id: 'company', label: 'Company Name', placeholder: 'Company Name', autoComplete: 'organization', required: true },
  { id: 'name', label: 'Name', placeholder: 'Full Name', autoComplete: 'name', required: true },
  { id: 'email', label: 'Email', placeholder: 'Email Address', type: 'email', autoComplete: 'email', required: true },
  { id: 'position', label: 'Position', placeholder: 'Position', autoComplete: 'organization-title', required: false },
] as const

/**
 * "가입하기" — AGENCY PILOT signup form (Figma node 3910:20692).
 * The entry screen of the agency pilot flow. Saving opens the success
 * dialog from node 3910:22043.
 */
export default function SignupPage() {
  const [saved, setSaved] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaved(true)
  }

  return (
    <main className={styles.page}>
      <div className={styles.group}>
        <div className={styles.logo}>
          <img className={styles.logoSymbol} src={symbol} alt="" />
          <img className={styles.logoWordmark} src={wordmark} alt="aedi-v" />
        </div>

        <form className={styles.card} onSubmit={handleSubmit}>
          <h1 className={styles.title}>AGENCY PILOT</h1>

          <div className={styles.fields}>
            {FIELDS.map((field) => (
              <div className={styles.field} key={field.id}>
                <label className={styles.label} htmlFor={field.id}>
                  {field.label}
                </label>
                <input
                  className={styles.input}
                  id={field.id}
                  name={field.id}
                  type={'type' in field ? field.type : 'text'}
                  placeholder={field.placeholder}
                  autoComplete={field.autoComplete}
                  required={field.required}
                />
              </div>
            ))}
          </div>

          <button className={styles.submit} type="submit">
            SAVE
          </button>
        </form>
      </div>

      {saved && <SuccessModal title="Saved successfully" onClose={() => setSaved(false)} />}
    </main>
  )
}
