/* Firebase Cloud Messaging service worker (background push). */
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyAdUm0JB840gYxV2BaDpnUwqvMS63Kl_6g',
  authDomain: 'home-weather-watcher.firebaseapp.com',
  projectId: 'home-weather-watcher',
  storageBucket: 'home-weather-watcher.firebasestorage.app',
  messagingSenderId: '38523139447',
  appId: '1:38523139447:web:f8344bbf1fd1f15e4c5d72'
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification || {}
  self.registration.showNotification(title || 'Home Weather Watch', {
    body: body || '',
    icon: icon || '/pwa-192.png'
  })
})
