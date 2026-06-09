const admin = require('firebase-admin')
const fetch = require('node-fetch')

const OPENWEATHER_KEY = process.env.OPENWEATHERMAP_API_KEY
const SERVICE_ACCOUNT_JSON = process.env.FIREBASE_SERVICE_ACCOUNT

if (!OPENWEATHER_KEY || !SERVICE_ACCOUNT_JSON) {
  console.error('Missing OPENWEATHERMAP_API_KEY or FIREBASE_SERVICE_ACCOUNT env vars')
  process.exit(1)
}

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(SERVICE_ACCOUNT_JSON))
})

const db = admin.firestore()
const messaging = admin.messaging()
const settingsRef = db.doc('settings/config')

const RAIN_CONDITIONS = new Set(['Rain', 'Drizzle', 'Thunderstorm'])

async function main() {
  const snap = await settingsRef.get()
  const data = snap.exists ? snap.data() : {}
  const { zipCode, fcmToken, isRaining: prevRaining = false } = data

  if (!zipCode) {
    console.log('No zip code set; nothing to do.')
    return
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?zip=${zipCode},us&units=imperial&appid=${OPENWEATHER_KEY}`
  const res = await fetch(url)
  if (!res.ok) {
    console.error('OpenWeather error', res.status, await res.text())
    process.exit(1)
  }
  const weather = await res.json()

  const mainCondition = weather.weather?.[0]?.main || 'Unknown'
  const description = weather.weather?.[0]?.description || ''
  const temp = weather.main?.temp ?? null
  const isRaining = RAIN_CONDITIONS.has(mainCondition)

  await settingsRef.set(
    {
      isRaining,
      currentWeather: {
        temp,
        condition: description,
        main: mainCondition,
        updatedAt: Date.now()
      }
    },
    { merge: true }
  )

  console.log(`Zip ${zipCode}: ${mainCondition} (${temp}°F). Raining: ${isRaining} (was ${prevRaining})`)

  if (fcmToken && isRaining !== prevRaining) {
    const notification = isRaining
      ? { title: 'Rain started', body: `It's now ${description} at ${zipCode}.` }
      : { title: 'Rain stopped', body: `Conditions: ${description} at ${zipCode}.` }
    try {
      await messaging.send({ token: fcmToken, notification })
      console.log('Push sent:', notification.title)
    } catch (err) {
      console.error('FCM send failed', err.message)
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
