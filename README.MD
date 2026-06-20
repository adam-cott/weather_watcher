# Home Weather Watch

A PWA that watches the weather for a saved ZIP code and sends a push notification the moment it starts or stops raining.

Built as a quick test of whether I could ship a fully automated pipeline — scheduled check, real API, real push notification — with zero manual upkeep.

**Live:** https://weather-watcher-theta.vercel.app/

## How It Works

A GitHub Actions cron job runs every 15 minutes, checks the OpenWeatherMap API for the saved ZIP, and compares it to the last known state in Firestore. If the rain state flips, it sends a push notification via Firebase Cloud Messaging.

## Scope

Built for a single ZIP code / single user by design — no auth or multi-user support.

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React (Vite) |
| Data + Push | Firebase (Firestore + Cloud Messaging) |
| Scheduling | GitHub Actions (cron) |
| Weather Data | OpenWeatherMap API |

## Getting Started

```bash
git clone https://github.com/adam-cott/weather_watcher.git
cd weather_watcher
npm install
npm run dev
```
