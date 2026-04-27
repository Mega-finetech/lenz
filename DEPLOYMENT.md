# 🚀 Lenz PWA – Deployment Guide

## What you have
A fully working Progressive Web App (PWA) that users can:
- Open in any browser via a link
- Install directly to their phone home screen (works on Android & iPhone)
- Use offline (cached after first load)

---

## Option A — Deploy to Vercel (Recommended, Free)

### Step 1 · Push to GitHub
1. Create a free account at https://github.com
2. Create a new repository called `lenz-app`
3. Upload all the files from this zip into the repo

### Step 2 · Deploy on Vercel
1. Go to https://vercel.com and sign up (free)
2. Click **"Add New Project"**
3. Import your `lenz-app` GitHub repository
4. Vercel will auto-detect it as a React app
5. Click **Deploy** — done in ~2 minutes!

### Step 3 · Share the link
Vercel gives you a URL like:
```
https://lenz-app.vercel.app
```
Share this link with anyone. They open it, and can install it like an app.

---

## Option B — Deploy to Netlify (Also Free)

1. Go to https://netlify.com
2. Drag and drop the `build/` folder (run `npm run build` first locally)
3. Netlify gives you a live URL instantly

---

## How Users Install Lenz on Their Phone

### On Android (Chrome):
1. Open the link in Chrome
2. A banner appears: **"Add Lenz to Home Screen"** → tap Install
3. Lenz icon appears on home screen — works like a native app

### On iPhone (Safari):
1. Open the link in **Safari** (must be Safari, not Chrome)
2. Tap the **Share** button (box with arrow at bottom)
3. Scroll down → tap **"Add to Home Screen"**
4. Tap **Add** — Lenz icon appears on home screen

---

## File Structure
```
lenz-pwa/
├── public/
│   ├── index.html        ← PWA meta tags, manifest link
│   ├── manifest.json     ← App name, icons, theme color
│   └── service-worker.js ← Offline caching
├── src/
│   ├── index.js          ← Entry point + SW registration
│   └── App.js            ← Full Lenz application
└── package.json          ← Dependencies
```

---

## API Key — How It Works
- Users enter their own Anthropic API key when they first open the app
- The key is saved to their device only (localStorage)
- It is NEVER sent to any server — goes directly to Anthropic's API
- Get a free key at: https://console.anthropic.com/account/keys

---

## Local Development (Optional)
```bash
cd lenz-pwa
npm install
npm start
```
Opens at http://localhost:3000

To build for production:
```bash
npm run build
```

---

## Next Steps After PWA
When ready for app stores:
1. **Android (Google Play)** — wrap with Capacitor, $25 one-time fee
2. **iOS (App Store)** — wrap with Capacitor, $99/year
3. **Backend** — add a Node.js server to hide the API key from users

---

Built with React · Anthropic Claude API · PWA Standards
