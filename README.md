# Krrish's Khaata 📒

A personal household expense tracking Progressive Web App (PWA) built to solve a real-world problem of managing and reconciling daily household transactions in a joint family setup.

🔗 **Live App:** [https://kris-jss.github.io/KrrishsKhaata/](https://kris-jss.github.io/KrrishsKhaata/)

---

## 🎯 Problem Statement

In a joint family, one person often handles all daily purchases — groceries, household items, personal orders — using multiple payment methods (credit cards, UPI, bank transfers, wallets). At month-end, reconciling 60-70+ transactions with bank statements becomes painful because:

- Multiple transactions from the same merchant (e.g., Flipkart) with similar amounts
- Hard to remember who asked for what
- Difficult to track which expenses are household vs someone's personal
- No easy way to calculate how much to collect from family members
- Direct cash/UPI credits given to family members get forgotten

**Krrish's Khaata** solves this by providing a quick, mobile-first logging system where every transaction is recorded immediately after payment with full context.

---

## ✨ Features

### 📝 Transaction Logging
- Log transactions instantly with **one-tap payment source selection**
- **4 categories:**
  - 🏠 **Household** — family groceries and daily needs
  - 👤 **Someone's Personal** — items ordered for a specific person
  - 🙋 **My Personal** — your own expenses
  - 🤝 **Direct Credit** — cash/UPI money lent to someone
- Pre-set family member names and platforms as **quick-select chips**
- Auto-captured date & time (editable if needed)
- Free-text fields for item details
- **Mode selection** for direct credits (Cash / UPI / Bank Transfer)
- Optional notes for direct credits

### ✏️ Edit & Delete Transactions
- **Edit button (✏️)** on every transaction — opens pre-filled form
- **Delete button (🗑️)** with confirmation dialog
- Available on both home screen and View All screen

### 💳 Flexible Payment Sources
- **Add unlimited payment sources** — not limited to 4
- **Remove sources** you don't need (minimum 1 required)
- **Rename** any source anytime
- **Choose emoji** for each source from preset options (💳 🏦 👛 💵 📱)
- Home screen **dynamically adapts** to show all your sources
- Old transactions remain safe even if a source is deleted

### 📊 Month-End Reconciliation
- **Statement Matching** — checkbox to tick off matched transactions
- **Settled checkbox** — mark direct credits as settled when repaid
- **Unmatched/Unsettled highlighting** — easily spot pending items
- **Multi-filter system:**
  - Filter by Month
  - Filter by Source
  - Filter by Category
  - Filter by Status (Matched/Unmatched/Settled/Unsettled)
- **Running totals** update as you filter

### 📈 Monthly Summary Dashboard
- **Category-wise breakdown** — Household / Personal / Self / Direct Credit
- **Source-wise breakdown** — spending per payment method
- **"Collect for Orders"** — person-wise amounts for personal orders
- **"Money Lent"** — person-wise direct credits with settled/unsettled status
- **"Amount to Ask from Father"** — household total ready to share
- **Reconciliation status** — matched vs pending count
- **Month selector** — view summary for any month

### 💬 WhatsApp Reminders
- **One-tap WhatsApp reminder** for personal orders:
  > "Hey [Name], you had asked me to order [Items] on [Date]. The amount for it was ₹[Amount]. Please settle when convenient 🙏"
- **Different message for direct credits:**
  > "Hey [Name], I had lent you ₹[Amount] on [Date]. Kindly settle when convenient 🙂"
- Opens WhatsApp directly with pre-filled message
- Available on both home screen and View All screen
- Shows only on relevant categories (Someone's Personal & Direct Credit)

### ⚙️ Settings & Customization
- **Manage Payment Sources** — add, remove, rename, change emoji
- **Manage People** — add, edit, remove family member names
- **Manage Platforms** — add, edit, remove shopping platforms
- All changes reflect immediately across the app

### 💾 Data Backup & Restore
- **Export Backup** — downloads a JSON file with all your data
- **Import Backup** — restore from a previous backup file
- Confirmation dialog before importing to prevent accidental overwrites
- Backward compatible — supports importing from older app versions

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **HTML5** | App structure and semantic markup |
| **CSS3** | Styling, animations, responsive design |
| **Vanilla JavaScript** | All app logic, data management, DOM manipulation |
| **LocalStorage** | Client-side persistent data storage |
| **PWA (Service Worker + Manifest)** | Offline support, installability, app-like experience |
| **WhatsApp Web API** | Pre-filled reminder messages |

### No frameworks. No libraries. No backend. No database server.

The entire app runs in the browser using only web standards — making it lightweight, fast, and completely private.

---

## 🔒 Privacy & Data Security

- **All data stays on your device** — nothing is sent to any server
- Uses browser's LocalStorage for persistence
- **No login, no account, no tracking, no analytics**
- Each user's data is completely isolated — even if multiple people use the same app URL
- Export feature lets you take manual backups
- Data persists across sessions, restarts, and even offline use
- **Only risk:** clearing browser data will erase app data (use Export Backup regularly)

---

## 📱 Installation

### On Android (Recommended)
1. Open [the app](https://kris-jss.github.io/KrrishsKhaata/) in **Chrome**
2. Tap the **three dots menu** (⋮)
3. Tap **"Add to Home Screen"** or **"Install App"**
4. The app appears on your home screen — no address bar, feels like a native app

### On Desktop
1. Open [the app](https://kris-jss.github.io/KrrishsKhaata/) in **Chrome**
2. Click the **install icon** in the address bar
3. Or use it directly in the browser

### Offline Usage
Once installed, the app works **even without internet**. All data is stored locally and the service worker caches all app files.

---

## 🎨 Design

- **Mobile-first** responsive design optimized for one-handed use
- Custom color palette: `#DAF1DE` · `#8EB69B` · `#235347` · `#C1E8FF` · `#7DA0CA`
- Google Fonts (Inter) for clean typography
- Smooth CSS animations and transitions
- Card-based UI with depth and shadows
- Floating Action Button (FAB) for quick transaction entry
- Chip-based selection for fast input
- Modal-based forms for focused interaction

---

## 📂 Project Structure
KrrishsKhaata/
- index.html # Main app — home screen + all transactions screen
- style.css # Complete styling — responsive, animations, modals
- app.js # Full app logic — CRUD, filters, summary, WhatsApp
- manifest.json # PWA manifest — app name, icons, theme
- service-worker.js # Service worker — offline caching
- README.md # Project documentation
- icons/
- icon-192.png # App icon (192x192)
- icon-512.png # App icon (512x512)

---

## 🧠 What I Learned

Building this project gave me hands-on experience with:

- **Progressive Web Apps** — service workers, manifests, caching strategies, and installability
- **LocalStorage** — client-side data persistence without any backend
- **DOM Manipulation** — building complex dynamic UIs with vanilla JavaScript
- **Mobile-First Design** — designing for small screens with touch-friendly interactions
- **Real-World Problem Solving** — identifying a genuine daily-life pain point and engineering a practical solution
- **UI/UX Thinking** — quick-entry forms, chip-based selections, intuitive navigation, and clean information hierarchy
- **Data Architecture** — structuring transaction data for flexible filtering, summarizing, and reconciliation
- **PWA Update Strategy** — versioned service worker caching for seamless app updates

---

## 🚀 Live Demo

🔗 [https://kris-jss.github.io/KrrishsKhaata/](https://kris-jss.github.io/KrrishsKhaata/)

---

## 👤 Author

**Krrish**
- GitHub: [@Kris-jss](https://github.com/Kris-jss)
- BTech 2nd Year Student

Built as a personal tool to solve a real problem — then turned into a portfolio project.

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).