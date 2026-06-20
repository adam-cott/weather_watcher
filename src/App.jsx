import { useEffect, useState } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { getToken, onMessage } from 'firebase/messaging'
import { db, getMessagingIfSupported, VAPID_KEY } from './firebase'

const SETTINGS_REF = doc(db, 'settings', 'config')

export default function App() {
  const [zip, setZip] = useState('')
  const [savedZip, setSavedZip] = useState('')
  const [weather, setWeather] = useState(null)
  const [status, setStatus] = useState('')

  useEffect(() => {
    return onSnapshot(SETTINGS_REF, (snap) => {
      const data = snap.data() || {}
      setSavedZip(data.zipCode || '')
      setWeather(data.currentWeather || null)
      setZip((current) => current || data.zipCode || '')
    })
  }, [])

  useEffect(() => {
    let unsub = () => {}
    getMessagingIfSupported().then((messaging) => {
      if (!messaging) return
      unsub = onMessage(messaging, (payload) => {
        setStatus(payload.notification?.title || 'Update received')
      })
    })
    return () => unsub()
  }, [])

  async function enableNotifications() {
    const messaging = await getMessagingIfSupported()
    if (!messaging) {
      setStatus('Push not supported in this browser')
      return
    }
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      setStatus('Notifications blocked')
      return
    }
    const swReg = await navigator.serviceWorker.register(
      `${import.meta.env.BASE_URL}firebase-messaging-sw.js`
    )
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swReg
    })
    if (token) {
      await setDoc(SETTINGS_REF, { fcmToken: token }, { merge: true })
      setStatus('Notifications enabled')
    } else {
      setStatus('Could not get push token')
    }
  }

  async function saveZip(e) {
    e.preventDefault()
    if (!/^\d{5}$/.test(zip)) {
      setStatus('Enter a valid 5-digit ZIP')
      return
    }
    try {
      await setDoc(SETTINGS_REF, { zipCode: zip }, { merge: true })
      setStatus('Saved')
      await enableNotifications()
    } catch (err) {
      console.error('Failed to save ZIP or enable notifications:', err)
      setStatus('Something went wrong. Please try again.')
    }
  }

  return (
    <main className="app">
      <header>
        <h1>Home Weather Watch</h1>
        <p className="subtitle">Get notified when rain starts and stops.</p>
      </header>

      <form onSubmit={saveZip} className="zip-form">
        <input
          type="text"
          inputMode="numeric"
          maxLength={5}
          value={zip}
          onChange={(e) => setZip(e.target.value.replace(/\D/g, ''))}
          placeholder="ZIP code"
          aria-label="ZIP code"
        />
        <button type="submit">Save</button>
      </form>

      {savedZip && <p className="muted">Watching ZIP {savedZip}</p>}

      <section className="card">
        {weather ? (
          <>
            <div className="temp">{Math.round(weather.temp)}°F</div>
            <div className="condition">{weather.condition}</div>
            {weather.updatedAt && (
              <div className="updated">
                Updated {new Date(weather.updatedAt).toLocaleTimeString()}
              </div>
            )}
          </>
        ) : (
          <div className="muted">No weather data yet.</div>
        )}
      </section>

      {status && <p className="status">{status}</p>}
    </main>
  )
}
