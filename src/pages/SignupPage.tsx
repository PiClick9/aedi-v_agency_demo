import { useRef, useState, type FormEvent } from 'react'
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
 * `type="email"` accepts a bare host such as `a@b` — the HTML spec's email
 * syntax deliberately allows a dotless domain. Require a real dotted domain
 * with a two-character-plus TLD on top of it.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[A-Za-z]{2,}$/

/**
 * "가입하기" — AGENCY PILOT signup form (Figma node 3910:20692).
 * The entry screen of the agency pilot flow. Saving opens the success
 * dialog from node 3910:22043.
 */
export default function SignupPage() {
  const [saved, setSaved] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // Native validation has already run and passed by this point, so this only
    // has to catch what `type="email"` lets through. The design has no error
    // state, so the message rides on the browser's own validation UI.
    const email = emailRef.current
    if (email && !EMAIL_PATTERN.test(email.value)) {
      email.setCustomValidity('Please enter a valid email address.')
      email.reportValidity()
      return
    }

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
                  ref={field.id === 'email' ? emailRef : undefined}
                  // A custom message sticks until cleared, so drop it as soon
                  // as the field is edited.
                  onInput={(event) => event.currentTarget.setCustomValidity('')}
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
