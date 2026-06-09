import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getMessaging, isSupported } from 'firebase/messaging'

export const firebaseConfig = {
  apiKey: 'AIzaSyAdUm0JB840gYxV2BaDpnUwqvMS63Kl_6g',
  authDomain: 'home-weather-watcher.firebaseapp.com',
  projectId: 'home-weather-watcher',
  storageBucket: 'home-weather-watcher.firebasestorage.app',
  messagingSenderId: '38523139447',
  appId: '1:38523139447:web:f8344bbf1fd1f15e4c5d72'
}

export const VAPID_KEY = 'BL0djC0uIqALgBKfWnNWBGasqHXef2wIdqhp6UZCB91zZgEjdTHtbZ-FnDxdnjWULipzr_MzqAeULuLCSyiNIg8'

export const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

export async function getMessagingIfSupported() {
  if (typeof window === 'undefined') return null
  if (!(await isSupported())) return null
  return getMessaging(app)
}
