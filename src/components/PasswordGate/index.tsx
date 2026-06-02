import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import styles from './styles.module.css'

export type Role = 'user' | 'admin'

// Which password unlocks which view. The password you enter determines the
// role — guests get the gallery, the admin password opens the tag editor.
const PASSWORDS: Record<string, Role> = {
  changeme: 'user',
  adminchangeme: 'admin',
}
const STORAGE_KEY = 'wedding-role'

function storedRole(): Role | null {
  const value = localStorage.getItem(STORAGE_KEY)
  return value === 'user' || value === 'admin' ? value : null
}

type Props = {
  children: (role: Role) => ReactNode
}

export function PasswordGate({ children }: Props) {
  const [role, setRole] = useState<Role | null>(storedRole)
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const [nearTop, setNearTop] = useState(true)

  // Only show the Sign out button while scrolled near the top of the page (the
  // title screen) — it fades out once you scroll down into the photo grid.
  useEffect(() => {
    if (!role) return
    function onScroll() {
      setNearTop(window.scrollY < window.innerHeight * 0.6)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [role])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const matched = PASSWORDS[input]
    if (matched) {
      localStorage.setItem(STORAGE_KEY, matched)
      setRole(matched)
    } else {
      setError(true)
    }
  }

  function handleSignOut() {
    localStorage.removeItem(STORAGE_KEY)
    setRole(null)
    setInput('')
    setError(false)
  }

  if (role) {
    // The admin editor is a scrollable list with its own sticky toolbar, so
    // keep Sign out always visible there; on the gallery it fades past the hero.
    const showSignOut = role === 'admin' || nearTop
    return (
      <>
        {children(role)}
        <button
          type="button"
          className={`${styles.signOut} ${showSignOut ? '' : styles.signOutHidden}`}
          onClick={handleSignOut}
          aria-hidden={!showSignOut}
        >
          Sign out
        </button>
      </>
    )
  }

  return (
    <main className={styles.gate}>
      <div className={styles.gateBg} aria-hidden="true" />
      <form onSubmit={handleSubmit} className={styles.gateForm}>
        <h1 className="neonderthaw-regular">Jonathan &amp; Jasper</h1>
        <p>Please enter the password to view the photos.</p>
        <input
          type="password"
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setError(false)
          }}
          placeholder="Password"
          autoFocus
          aria-invalid={error}
        />
        {error && <p className={styles.error}>Incorrect password. Please try again.</p>}
        <button type="submit">Enter</button>
      </form>
    </main>
  )
}
