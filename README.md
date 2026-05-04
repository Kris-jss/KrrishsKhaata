# Krrish's Khaata 📒

A personal household expense tracking Progressive Web App (PWA) built to solve a real-world problem of managing and reconciling daily household transactions in a joint family setup.

---

## 🎯 Problem Statement

In a joint family, one person often handles all daily purchases — groceries, household items, personal orders — using multiple payment methods (credit cards, UPI, bank transfers, wallets). At month-end, reconciling 60-70+ transactions with bank statements becomes painful because:

- Multiple transactions from the same merchant (e.g., Flipkart) with similar amounts
- Hard to remember who asked for what
- Difficult to track which expenses are household vs someone's personal
- No easy way to calculate how much to collect from family members

**Krrish's Khaata** solves this by providing a quick, mobile-first logging system where every transaction is recorded immediately after payment with full context.

---

## ✨ Features

### Core Transaction Logging
- Log transactions instantly with **one-tap payment source selection**
- Categorize as **Household**, **Someone's Personal**, or **My Personal**
- Pre-set family member names and platforms as quick-select chips
- Auto-captured date & time (editable if needed)
- Free-text fields for item details

### Payment Source Management
- 4 configurable payment sources (Credit Cards, Bank, Wallet)
- Rename sources anytime (e.g., "Axis CC", "Kotak CC")
- Per-source spending totals on home screen

### Month-End Reconciliation
- **Statement Matching** — checkbox to tick off matched transactions
- **Unmatched highlighting** — easily spot transactions you haven't verified
- **Multi-filter system** — filter by Month, Source, Category, Match Status

### Monthly Summary Dashboard
- Category-wise breakdown (Household / Personal / Self)
- Source-wise breakdown
- **Person-wise "Collect from Others"** — know exactly who owes you how much
- **"Amount to Ask from Father"** — household total ready to share
- Statement matching progress

### Smart Features
- **WhatsApp Reminder** — one-tap reminder message to family members for personal expenses
- **Delete with confirmation** — safe deletion of wrong entries
- **Export/Import backup** — JSON-based data backup and restore

### Settings & Customization
- Rename payment sources
- Add/Edit/Remove family member names
- Add/Edit/Remove platform names
- Full data backup and restore

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **HTML5** | App structure and semantic markup |
| **CSS3** | Styling, animations, responsive design |
| **Vanilla JavaScript** | All app logic, data management, DOM manipulation |
| **LocalStorage** | Client-side persistent data storage |
| **PWA (Service Worker + Manifest)** | Offline support, installability, app-like experience |

### No frameworks. No libraries. No backend. No database server.

The entire app runs in the browser using only web standards — making it lightweight, fast, and completely private.

---

## 📱 Installation

### On Android (Recommended)
1. Open the app URL in **Chrome**
2. Tap the **three dots menu** (⋮)
3. Tap **"Add to Home Screen"** or **"Install App"**
4. The app will appear on your home screen like a native app

### On Desktop
1. Open the app URL in **Chrome**
2. Click the **install icon** in the address bar
3. Or use it directly in the browser

---

## 🎨 Design

- **Mobile-first** responsive design
- Custom color palette: `#DAF1DE` · `#8EB69B` · `#235347` · `#C1E8FF` · `#7DA0CA`
- Google Fonts (Inter) for clean typography
- Smooth animations and transitions
- Card-based UI with depth and shadows
- Floating Action Button (FAB) for quick transaction entry

---

## 📂 Project Structure

KrrishsKhaata/
- index.html # Main app HTML structure
- style.css # All styling and animations
- app.js # Complete app logic and functionality
- manifest.json # PWA manifest for installability
- service-worker.js # Service worker for offline caching
- README.md # Project documentation
- icons/
- icon-192.png # App icon (192x192)
- icon-512.png # App icon (512x512)


---

## 🔒 Privacy & Data

- **All data stays on your device** — nothing is sent to any server
- Uses browser's LocalStorage for persistence
- Export feature lets you take manual backups as JSON files
- Import feature lets you restore from backups
- No login, no account, no tracking, no analytics

---

## 🧠 What I Learned

This project helped me understand:
- **Progressive Web Apps** — how service workers, manifests, and caching work together to create installable offline-capable web apps
- **LocalStorage** — client-side data persistence without a backend
- **DOM Manipulation** — building dynamic UIs with vanilla JavaScript
- **Mobile-First Design** — designing for small screens first, then scaling up
- **Real-World Problem Solving** — identifying a genuine daily-life pain point and engineering a practical solution
- **UI/UX Thinking** — making quick-entry forms, chip-based selections, and intuitive navigation

---

## 🚀 Live Demo

🔗 [https://kris-jss.github.io/KrrishsKhaata/](https://kris-jss.github.io/KrrishsKhaata/)

---

## 👤 Author

**Krrish**
- GitHub: [@Kris-jss](https://github.com/Kris-jss)
- BTech 2nd Year Student

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
