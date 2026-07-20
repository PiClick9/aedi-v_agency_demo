import type { FormEvent } from 'react'
import symbol from '../assets/aedi-v-symbol.svg'
import wordmark from '../assets/aedi-v-wordmark.svg'
import styles from './SignupPage.module.css'

const FIELDS = [
  { id: 'company', label: 'Company Name', placeholder: 'Company Name', autoComplete: 'organization' },
  { id: 'name', label: 'Name', placeholder: 'Full Name', autoComplete: 'name' },
  { id: 'email', label: 'Email', placeholder: 'Email Address', type: 'email', autoComplete: 'email' },
  { id: 'position', label: 'Position', placeholder: 'Position', autoComplete: 'organization-title' },
] as const

/**
 * "가입하기" — AGENCY PILOT signup form (Figma node 3910:20692).
 * The entry screen of the agency pilot flow.
 */
export default function SignupPage() {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
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
                />
              </div>
            ))}
          </div>

          <button className={styles.submit} type="submit">
            SAVE
          </button>
        </form>
      </div>
    </main>
  )
}
