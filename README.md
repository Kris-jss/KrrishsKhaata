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
- **Multi-person selection** — select multiple family members for a single transaction (e.g., "Mother and Sister asked to order vegetables")
- Pre-set family member names and platforms as **quick-select chips**
- Auto-captured date & time (editable if needed)
- Free-text fields for item details
- **Mode selection** for direct credits (Cash / UPI / Bank Transfer)
- Optional notes for direct credits

### 🔍 Search
- **Live search bar** on the View All screen
- Search across **person name, items, amount, platform, and source**
- Results update instantly as you type
- Works alongside all existing filters

### 🧮 Calculator Mode
- **Select specific transactions** and see their sum instantly
- Tap the 🧮 icon on the View All screen to enter calculator mode
- Tap transactions to select/deselect them
- **Floating bar** at the bottom shows selected count and total amount
- Tap "Done" to exit calculator mode
- Perfect for when you're sitting with your statement and want to total specific entries

### ✏️ Edit & Delete Transactions
- **Edit button (✏️)** on every transaction — opens pre-filled form with all original data
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
- **Multi-person message** when multiple people are involved:
  > "Hey [Name1], you and [Name2] asked me to order [Items] on [Date]. The amount for it was ₹[Amount]. Please settle when convenient 🙏"
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
