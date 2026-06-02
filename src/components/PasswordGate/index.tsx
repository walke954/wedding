import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import styles from './styles.module.css'

const PASSWORD = 'changeme'
const STORAGE_KEY = 'wedding-signed-in'

function isSignedIn() {
  return localStorage.getItem(STORAGE_KEY) === 'true'
}

type Props = {
  children: ReactNode
}

export function PasswordGate({ children }: Props) {
  const [signedIn, setSignedIn] = useState(isSignedIn)
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const [nearTop, setNearTop] = useState(true)

  // Only show the Sign out button while scrolled near the top of the page (the
  // title screen) — it fades out once you scroll down into the photo grid.
  useEffect(() => {
    if (!signedIn) return
    function onScroll() {
      setNearTop(window.scrollY < window.innerHeight * 0.6)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [signedIn])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (input === PASSWORD) {
      localStorage.setItem(STORAGE_KEY, 'true')
      setSignedIn(true)
    } else {
      setError(true)
    }
  }

  function handleSignOut() {
    localStorage.removeItem(STORAGE_KEY)
    setSignedIn(false)
    setInput('')
    setError(false)
  }

  if (signedIn) {
    return (
      <>
        {children}
        <button
          type="button"
          className={`${styles.signOut} ${nearTop ? '' : styles.signOutHidden}`}
          onClick={handleSignOut}
          aria-hidden={!nearTop}
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
