/** Registration API client for the AGENCY PILOT signup form.
 *
 * US region only for now. To add regions later, turn API_BASE into a lookup;
 * today a single constant is enough (YAGNI). */

const API_BASE = 'https://global.aedi.ai'

export type RegistrationInput = {
  name: string
  bizName: string
  email: string
  position: string
}

export type RegistrationResult = {
  link: string
  uIdx: number
}

/** Raw success shape returned by /aediv/simple_registration. */
type ApiResponse = {
  status?: string
  msg?: string
  u_idx?: number
  link?: string
}

const DEFAULT_ERROR = 'Registration failed. Please try again.'

/**
 * Register an agency and return its personalised invite link.
 * Throws an Error (with the server message when available) on any failure —
 * a non-"S" status, an HTTP error, or a network/CORS/parse problem.
 */
export async function registerAgency(input: RegistrationInput): Promise<RegistrationResult> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}/aediv/simple_registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
  } catch {
    // fetch rejects on network failure and on CORS-blocked responses.
    throw new Error(DEFAULT_ERROR)
  }

  let data: ApiResponse
  try {
    data = (await res.json()) as ApiResponse
  } catch {
    throw new Error(DEFAULT_ERROR)
  }

  if (!res.ok || data.status !== 'S' || !data.link) {
    throw new Error(data.msg || DEFAULT_ERROR)
  }

  return { link: data.link, uIdx: data.u_idx ?? 0 }
}
