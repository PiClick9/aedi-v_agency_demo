import { useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import PilotLayout from '../components/PilotLayout'
import SuccessModal from '../components/SuccessModal'
import { registerAgency } from '../api/registration'
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

// Which dialog, if any, is open after a submit attempt.
type Dialog = { kind: 'success'; link: string } | { kind: 'error'; message: string } | null

/**
 * "가입하기" — AGENCY PILOT signup form (Figma node 3910:20692).
 * Submitting registers the agency via the API; on success the returned invite
 * link is carried to the INCLUDES screen, on failure an error dialog shows.
 */
export default function SignupPage() {
  const [dialog, setDialog] = useState<Dialog>(null)
  const [submitting, setSubmitting] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    // Native validation has already run and passed by this point, so this only
    // has to catch what `type="email"` lets through. The design has no error
    // state, so the message rides on the browser's own validation UI.
    const email = emailRef.current
    if (email && !EMAIL_PATTERN.test(email.value)) {
      email.setCustomValidity('Please enter a valid email address.')
      email.reportValidity()
      return
    }

    const form = new FormData(event.currentTarget)
    const str = (key: string) => String(form.get(key) ?? '').trim()

    setSubmitting(true)
    try {
      const { link } = await registerAgency({
        bizName: str('company'),
        name: str('name'),
        email: str('email'),
        position: str('position'),
      })
      setDialog({ kind: 'success', link })
    } catch (err) {
      setDialog({ kind: 'error', message: err instanceof Error ? err.message : 'Registration failed. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  const closeDialog = () => {
    if (dialog?.kind === 'success') navigate('/includes', { state: { link: dialog.link } })
    else setDialog(null)
  }

  return (
    <PilotLayout>
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

        <button className={styles.submit} type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : 'SAVE'}
        </button>
      </form>

      {dialog && (
        <SuccessModal
          title={dialog.kind === 'success' ? 'Saved successfully' : dialog.message}
          onClose={closeDialog}
        />
      )}
    </PilotLayout>
  )
}
