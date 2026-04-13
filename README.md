# Wanderpack — Web

A smart packing list app that learns what you pack over time. Web companion to the iOS app, built with React and TypeScript.

## Features

- **Smart packing lists** — generates items based on destination, dates, activities, transport, and weather
- **Rewear & laundry logic** — adjusts clothing quantities so you don't overpack
- **Weather-aware** — fetches forecasts via Open-Meteo (free, no API key) and adds weather-specific gear
- **Post-trip learning** — feedback after each trip teaches the app what to add or skip next time
- **Carry-on flagging** — highlights items that may be restricted in carry-on luggage
- **Destination photos** — powered by Pexels
- **Travel stats** — custom SVG world map with Natural Earth projection
- **Clothing preferences** — gender, bottoms mix, personal care settings
- **Voice packing** — speak item names to check them off hands-free
- **Offline-first** — all data stored locally in IndexedDB, no account required

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS 4
- Dexie (IndexedDB)
- Open-Meteo (weather, no auth required)
- Pexels API (destination photos, key required)
- GitHub Pages (deployment)

## Setup

1. Clone the repo
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file:
   ```
   VITE_PEXELS_API_KEY=YOUR_KEY_HERE
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```

The app works without a Pexels key — destination photos just won't load.

## License

Copyright (c) 2026 Wanderpack. All rights reserved. See [LICENSE](LICENSE) for details.
