// ===== DEFAULT SETTINGS =====
var defaultSettings = {
  sources: {
    card1: "Card 1",
    card2: "Card 2",
    bank: "Direct Bank",
    wallet: "Wallet"
  }
};

var defaultNames = ["Father", "Mother", "Sister", "Brother", "Dadi", "Chachu", "Bua", "Self"];
var defaultPlatforms = ["Flipkart", "Amazon", "Swiggy", "Zepto", "BigBasket"];

function loadNames() {
  var saved = localStorage.getItem("kk_names");
  if (saved) return JSON.parse(saved);
  return defaultNames.slice();
}

function saveNames(names) {
  localStorage.setItem("kk_names", JSON.stringify(names));
}

function loadPlatforms() {
  var saved = localStorage.getItem("kk_platforms");
  if (saved) return JSON.parse(saved);
  return defaultPlatforms.slice();
}

function savePlatforms(platforms) {
  localStorage.setItem("kk_platforms", JSON.stringify(platforms));
}

function loadSettings() {
  var saved = localStorage.getItem("kk_settings");
  if (saved) return JSON.parse(saved);
  return JSON.parse(JSON.stringify(defaultSettings));
}

function saveSettings(settings) {
  localStorage.setItem("kk_settings", JSON.stringify(settings));
}

function loadTransactions() {
  var saved = localStorage.getItem("kk_transactions");
  if (saved) return JSON.parse(saved);
  return [];
}

function saveTransactions(transactions) {
  localStorage.setItem("kk_transactions", JSON.stringify(transactions));
}

// ===== WHATSAPP REMIND =====
function sendWhatsAppReminder(txn) {
  var d = new Date(txn.dateTime);
  var dateStr = d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  var amount = Number(txn.amount).toLocaleString("en-IN");
  var items = txn.items || "an item";
  var name = txn.personName || "there";

  var message = "Hey " + name + ", you had asked me to order " + items + " on " + dateStr + ". The amount for it was ₹" + amount + ". Please settle when convenient 🙏";

  var url = "https://wa.me/?text=" + encodeURIComponent(message);
  window.open(url, "_blank");
}

// ===== APPLY SOURCE NAMES =====
function applySourceNames() {
  var settings = loadSettings();
  var cards = document.querySelectorAll(".source-card");
  cards.forEach(function (card) {
    var key = card.getAttribute("data-source");
    var nameEl = card.querySelector(".source-name");
    if (settings.sources[key]) {
      nameEl.textContent = settings.sources[key];
    }
  });
}

// ===== UPDATE HOME SCREEN TOTALS =====
function updateHomeTotals() {
  var transactions = loadTransactions();
  var now = new Date();
  var currentMonth = now.getMonth();
  var currentYear = now.getFullYear();

  var thisMonth = transactions.filter(function (t) {
    var d = new Date(t.dateTime);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  var monthTotal = 0;
  thisMonth.forEach(function (t) {
    monthTotal += Number(t.amount);
  });

  document.getElementById("monthTotal").textContent = "₹" + monthTotal.toLocaleString("en-IN");
  document.getElementById("monthCount").textContent = thisMonth.length;

  var sourceTotals = { card1: 0, card2: 0, bank: 0, wallet: 0 };
  thisMonth.forEach(function (t) {
    if (sourceTotals.hasOwnProperty(t.source)) {
      sourceTotals[t.source] += Number(t.amount);
    }
  });

  var cards = document.querySelectorAll(".source-card");
  cards.forEach(function (card) {
    var key = card.getAttribute("data-source");
    var totalEl = card.querySelector(".source-total");
    totalEl.textContent = "₹" + sourceTotals[key].toLocaleString("en-IN");
  });

  updateRecentList(thisMonth);
}

// ===== UPDATE RECENT LIST =====
function updateRecentList(transactions) {
  var container = document.getElementById("recentList");
  var settings = loadSettings();

  if (transactions.length === 0) {
    container.innerHTML =
      '<div class="empty-state">' +
      '<span class="empty-icon">📝</span>' +
      "<p>No transactions yet</p>" +
      '<p class="empty-hint">Tap a payment source above to add one</p>' +
      "</div>";
    return;
  }

  var sorted = transactions.slice().sort(function (a, b) {
    return new Date(b.dateTime) - new Date(a.dateTime);
  });

  var recent = sorted.slice(0, 5);

  var categoryColors = {
    household: "#235347",
    personal_other: "#7da0ca",
    personal_self: "#8eb69b"
  };

  var categoryLabels = {
    household: "🏠 Household",
    personal_self: "🙋 My Personal"
  };

  var html = "";
  recent.forEach(function (t) {
    var d = new Date(t.dateTime);
    var dateStr = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    var timeStr = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    var sourceName = settings.sources[t.source] || t.source;
    var catColor = categoryColors[t.category] || "#235347";
    var catLabel = categoryLabels[t.category] || "👤 " + (t.personName || "Someone");

    var whatsappBtn = "";
    if (t.category === "personal_other") {
      whatsappBtn = '<button class="wa-btn" data-id="' + t.id + '" title="Remind via WhatsApp">💬</button>';
    }

    html +=
      '<div class="txn-item ' + (t.matched ? "txn-matched" : "") + '">' +
      '<div class="txn-left">' +
      '<div class="txn-category-dot" style="background:' + catColor + '"></div>' +
      '<div class="txn-details">' +
      '<span class="txn-items">' + (t.items || "No details") + "</span>" +
      '<span class="txn-meta">' + catLabel + " · " + sourceName + "</span>" +
      '<span class="txn-meta">' + (t.platform || "") + " · " + dateStr + " · " + timeStr + "</span>" +
      "</div>" +
      "</div>" +
      '<div class="txn-right">' +
      '<span class="txn-amount">₹' + Number(t.amount).toLocaleString("en-IN") + "</span>" +
      whatsappBtn +
      "</div>" +
      "</div>";
  });

  container.innerHTML = html;

  // WhatsApp button listeners for recent list
  container.querySelectorAll(".wa-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-id");
      var allTxns = loadTransactions();
      for (var i = 0; i < allTxns.length; i++) {
        if (allTxns[i].id === id) {
          sendWhatsAppReminder(allTxns[i]);
          break;
        }
      }
    });
  });
}

// ===== SCREEN NAVIGATION =====
function showScreen(screenId) {
  document.getElementById("homeScreen").classList.add("screen-hidden");
  document.getElementById("allTxnScreen").classList.add("screen-hidden");
  document.getElementById(screenId).classList.remove("screen-hidden");
}

// ===== ALL TRANSACTIONS SCREEN =====
function openAllTransactions() {
  showScreen("allTxnScreen");
  populateFilters();
  applyFilters();
}

function populateFilters() {
  var settings = loadSettings();
  var transactions = loadTransactions();

  var monthSelect = document.getElementById("filterMonth");
  var months = {};
  transactions.forEach(function (t) {
    var d = new Date(t.dateTime);
    var key = d.getFullYear() + "-" + String(d.getMonth()).padStart(2, "0");
    var label = d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    months[key] = label;
  });

  var now = new Date();
  var currentKey = now.getFullYear() + "-" + String(now.getMonth()).padStart(2, "0");
  var currentLabel = now.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  if (!months[currentKey]) {
    months[currentKey] = currentLabel;
  }

  var sortedKeys = Object.keys(months).sort().reverse();

  var monthHtml = '<option value="all">All Months</option>';
  sortedKeys.forEach(function (key) {
    var sel = key === currentKey ? "selected" : "";
    monthHtml += '<option value="' + key + '" ' + sel + ">" + months[key] + "</option>";
  });
  monthSelect.innerHTML = monthHtml;

  var sourceSelect = document.getElementById("filterSource");
  var sourceHtml = '<option value="all">All Sources</option>';
  var sourceKeys = Object.keys(settings.sources);
  sourceKeys.forEach(function (key) {
    sourceHtml += '<option value="' + key + '">' + settings.sources[key] + "</option>";
  });
  sourceSelect.innerHTML = sourceHtml;
}

function applyFilters() {
  var transactions = loadTransactions();
  var settings = loadSettings();

  var monthVal = document.getElementById("filterMonth").value;
  var sourceVal = document.getElementById("filterSource").value;
  var categoryVal = document.getElementById("filterCategory").value;
  var statusVal = document.getElementById("filterStatus").value;

  var filtered = transactions.filter(function (t) {
    if (monthVal !== "all") {
      var d = new Date(t.dateTime);
      var key = d.getFullYear() + "-" + String(d.getMonth()).padStart(2, "0");
      if (key !== monthVal) return false;
    }
    if (sourceVal !== "all" && t.source !== sourceVal) return false;
    if (categoryVal !== "all" && t.category !== categoryVal) return false;
    if (statusVal === "matched" && !t.matched) return false;
    if (statusVal === "unmatched" && t.matched) return false;
    return true;
  });

  filtered.sort(function (a, b) {
    return new Date(b.dateTime) - new Date(a.dateTime);
  });

  var total = 0;
  var unmatchedTotal = 0;
  filtered.forEach(function (t) {
    total += Number(t.amount);
    if (!t.matched) unmatchedTotal++;
  });

  document.getElementById("filteredTotal").textContent = "₹" + total.toLocaleString("en-IN");
  document.getElementById("filteredCount").textContent = filtered.length;
  document.getElementById("unmatchedCount").textContent = unmatchedTotal;

  var container = document.getElementById("allTxnList");

  if (filtered.length === 0) {
    container.innerHTML =
      '<div class="empty-state">' +
      '<span class="empty-icon">🔍</span>' +
      "<p>No transactions found</p>" +
      "</div>";
    return;
  }

  var categoryColors = {
    household: "#235347",
    personal_other: "#7da0ca",
    personal_self: "#8eb69b"
  };

  var categoryLabels = {
    household: "🏠 Household",
    personal_self: "🙋 My Personal"
  };

  var html = "";
  filtered.forEach(function (t) {
    var d = new Date(t.dateTime);
    var dateStr = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    var timeStr = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    var sourceName = settings.sources[t.source] || t.source;
    var catColor = categoryColors[t.category] || "#235347";
    var catLabel = categoryLabels[t.category] || "👤 " + (t.personName || "Someone");

    var whatsappBtn = "";
    if (t.category === "personal_other") {
      whatsappBtn = '<button class="wa-btn" data-id="' + t.id + '" title="Remind via WhatsApp">💬</button>';
    }

    html +=
      '<div class="txn-item-full ' + (t.matched ? "txn-matched-full" : "") + '">' +
      '<input type="checkbox" class="txn-checkbox" data-id="' + t.id + '" ' + (t.matched ? "checked" : "") + " />" +
      '<div class="txn-content">' +
      '<div class="txn-left">' +
      '<div class="txn-category-dot" style="background:' + catColor + '"></div>' +
      '<div class="txn-details">' +
      '<span class="txn-items">' + (t.items || "No details") + "</span>" +
      '<span class="txn-meta">' + catLabel + " · " + sourceName + "</span>" +
      '<span class="txn-meta">' + (t.platform || "") + " · " + dateStr + " · " + timeStr + "</span>" +
      "</div>" +
      "</div>" +
      '<div class="txn-right">' +
      '<span class="txn-amount">₹' + Number(t.amount).toLocaleString("en-IN") + "</span>" +
      '<div class="txn-actions">' +
      whatsappBtn +
      '<button class="delete-btn" data-id="' + t.id + '" title="Delete">🗑️</button>' +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>";
  });

  container.innerHTML = html;

  // WhatsApp button listeners
  container.querySelectorAll(".wa-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-id");
      var allTxns = loadTransactions();
      for (var i = 0; i < allTxns.length; i++) {
        if (allTxns[i].id === id) {
          sendWhatsAppReminder(allTxns[i]);
          break;
        }
      }
    });
  });

  // Delete buttons
  container.querySelectorAll(".delete-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-id");
      var allTxns = loadTransactions();
      var txnToDelete = null;

      for (var i = 0; i < allTxns.length; i++) {
        if (allTxns[i].id === id) {
          txnToDelete = allTxns[i];
          break;
        }
      }

      if (!txnToDelete) return;

      var confirmMsg = "Delete this transaction?\n\n" +
        "Item: " + (txnToDelete.items || "No details") + "\n" +
        "Amount: ₹" + Number(txnToDelete.amount).toLocaleString("en-IN") + "\n" +
        "Date: " + new Date(txnToDelete.dateTime).toLocaleDateString("en-IN") + "\n\n" +
        "This cannot be undone.";

      if (!confirm(confirmMsg)) return;

      var updatedTxns = allTxns.filter(function (t) {
        return t.id !== id;
      });

      saveTransactions(updatedTxns);
      updateHomeTotals();
      applyFilters();

      alert("Transaction deleted successfully!");
    });
  });

  // Checkbox listeners
  container.querySelectorAll(".txn-checkbox").forEach(function (cb) {
    cb.addEventListener("change", function () {
      var id = cb.getAttribute("data-id");
      var allTxns = loadTransactions();
      for (var i = 0; i < allTxns.length; i++) {
        if (allTxns[i].id === id) {
          allTxns[i].matched = cb.checked;
          break;
        }
      }
      saveTransactions(allTxns);

      var parentItem = cb.closest(".txn-item-full");
      if (cb.checked) {
        parentItem.classList.add("txn-matched-full");
      } else {
        parentItem.classList.remove("txn-matched-full");
      }

      applyFilters();
    });
  });
}

// ===== ADD TRANSACTION MODAL =====
function createAddTransactionModal(preSelectedSource) {
  var existing = document.getElementById("addTxnModal");
  if (existing) existing.remove();

  var settings = loadSettings();
  var names = loadNames();
  var platforms = loadPlatforms();

  var overlay = document.createElement("div");
  overlay.id = "addTxnModal";
  overlay.className = "modal-overlay";

  var sourceOptionsHtml = "";
  var sourceKeys = Object.keys(settings.sources);
  for (var i = 0; i < sourceKeys.length; i++) {
    var key = sourceKeys[i];
    var selected = key === preSelectedSource ? "selected" : "";
    sourceOptionsHtml += '<option value="' + key + '" ' + selected + ">" + settings.sources[key] + "</option>";
  }

  var nameChipsHtml = "";
  for (var i = 0; i < names.length; i++) {
    nameChipsHtml += '<button type="button" class="chip" data-value="' + names[i] + '">' + names[i] + "</button>";
  }

  var platformChipsHtml = "";
  for (var i = 0; i < platforms.length; i++) {
    platformChipsHtml += '<button type="button" class="chip" data-value="' + platforms[i] + '">' + platforms[i] + "</button>";
  }

  overlay.innerHTML =
    '<div class="modal-box modal-tall">' +
    '<div class="modal-header">' +
    "<h2>Add Transaction</h2>" +
    '<button class="modal-close" id="closeTxn">✕</button>' +
    "</div>" +
    '<div class="modal-body modal-scroll">' +
    '<div class="form-field">' +
    "<label>Payment Source</label>" +
    '<select id="txnSource">' + sourceOptionsHtml + "</select>" +
    "</div>" +
    '<div class="form-field">' +
    "<label>Category</label>" +
    '<div class="category-grid">' +
    '<button type="button" class="category-btn" data-cat="household">🏠 Household</button>' +
    '<button type="button" class="category-btn" data-cat="personal_other">👤 Someone\'s Personal</button>' +
    '<button type="button" class="category-btn" data-cat="personal_self">🙋 My Personal</button>' +
    "</div>" +
    "</div>" +
    '<div class="form-field" id="personField">' +
    "<label>Who asked / For whom</label>" +
    '<div class="chip-container" id="nameChips">' + nameChipsHtml + "</div>" +
    '<input type="text" id="txnPerson" placeholder="Or type a name..." />' +
    "</div>" +
    '<div class="form-field">' +
    "<label>Platform</label>" +
    '<div class="chip-container" id="platformChips">' + platformChipsHtml + "</div>" +
    '<input type="text" id="txnPlatform" placeholder="Or type platform name..." />' +
    "</div>" +
    '<div class="form-field">' +
    "<label>What was ordered</label>" +
    '<input type="text" id="txnItems" placeholder="e.g. Milk, Potato, Shampoo" />' +
    "</div>" +
    '<div class="form-field">' +
    "<label>Amount (₹)</label>" +
    '<input type="number" id="txnAmount" placeholder="e.g. 350" inputmode="numeric" />' +
    "</div>" +
    '<div class="form-field">' +
    "<label>Date & Time</label>" +
    '<input type="datetime-local" id="txnDateTime" />' +
    "</div>" +
    "</div>" +
    '<div class="modal-footer">' +
    '<button class="btn-save" id="saveTxn">Save Transaction</button>' +
    "</div>" +
    "</div>";

  document.body.appendChild(overlay);

  var now = new Date();
  var offset = now.getTimezoneOffset() * 60000;
  var local = new Date(now - offset);
  document.getElementById("txnDateTime").value = local.toISOString().slice(0, 16);

  var selectedCategory = null;
  var catBtns = overlay.querySelectorAll(".category-btn");
  catBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      catBtns.forEach(function (b) { b.classList.remove("chip-active"); });
      btn.classList.add("chip-active");
      selectedCategory = btn.getAttribute("data-cat");

      var personField = document.getElementById("personField");
      if (selectedCategory === "personal_self") {
        personField.style.display = "none";
      } else {
        personField.style.display = "flex";
      }
    });
  });

  var nameChipBtns = overlay.querySelectorAll("#nameChips .chip");
  var txnPersonInput = document.getElementById("txnPerson");

  nameChipBtns.forEach(function (chip) {
    chip.addEventListener("click", function () {
      nameChipBtns.forEach(function (c) { c.classList.remove("chip-active"); });
      chip.classList.add("chip-active");
      txnPersonInput.value = "";
    });
  });

  txnPersonInput.addEventListener("input", function () {
    if (txnPersonInput.value.trim() !== "") {
      nameChipBtns.forEach(function (c) { c.classList.remove("chip-active"); });
    }
  });

  var platChipBtns = overlay.querySelectorAll("#platformChips .chip");
  var txnPlatformInput = document.getElementById("txnPlatform");

  platChipBtns.forEach(function (chip) {
    chip.addEventListener("click", function () {
      platChipBtns.forEach(function (c) { c.classList.remove("chip-active"); });
      chip.classList.add("chip-active");
      txnPlatformInput.value = "";
    });
  });

  txnPlatformInput.addEventListener("input", function () {
    if (txnPlatformInput.value.trim() !== "") {
      platChipBtns.forEach(function (c) { c.classList.remove("chip-active"); });
    }
  });

  document.getElementById("closeTxn").addEventListener("click", function () {
    overlay.remove();
  });

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) overlay.remove();
  });

  document.getElementById("saveTxn").addEventListener("click", function () {
    var source = document.getElementById("txnSource").value;

    var activeNameChip = overlay.querySelector("#nameChips .chip.chip-active");
    var personName = document.getElementById("txnPerson").value.trim() || (activeNameChip ? activeNameChip.getAttribute("data-value") : "");

    var activePlatChip = overlay.querySelector("#platformChips .chip.chip-active");
    var platform = document.getElementById("txnPlatform").value.trim() || (activePlatChip ? activePlatChip.getAttribute("data-value") : "");

    var items = document.getElementById("txnItems").value.trim();
    var amount = document.getElementById("txnAmount").value.trim();
    var dateTime = document.getElementById("txnDateTime").value;

    if (!selectedCategory) {
      alert("Please select a category");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    if (selectedCategory !== "personal_self" && !personName) {
      alert("Please enter who asked for this");
      return;
    }

    var txn = {
      id: Date.now().toString(),
      source: source,
      category: selectedCategory,
      personName: selectedCategory === "personal_self" ? "Self" : personName,
      platform: platform,
      items: items,
      amount: Number(amount),
      dateTime: dateTime,
      matched: false
    };

    var transactions = loadTransactions();
    transactions.push(txn);
    saveTransactions(transactions);

    updateHomeTotals();
    overlay.remove();
  });
}

// ===== SETTINGS MODAL =====
function createSettingsModal() {
  var existing = document.getElementById("settingsModal");
  if (existing) existing.remove();

  var settings = loadSettings();
  var names = loadNames();
  var platforms = loadPlatforms();

  var overlay = document.createElement("div");
  overlay.id = "settingsModal";
  overlay.className = "modal-overlay";

  var namesListHtml = "";
  for (var i = 0; i < names.length; i++) {
    namesListHtml +=
      '<div class="editable-item">' +
      '<input type="text" class="edit-name-input" data-index="' + i + '" value="' + names[i] + '" maxlength="20" />' +
      '<button type="button" class="remove-btn" data-type="name" data-index="' + i + '">✕</button>' +
      "</div>";
  }

  var platformsListHtml = "";
  for (var i = 0; i < platforms.length; i++) {
    platformsListHtml +=
      '<div class="editable-item">' +
      '<input type="text" class="edit-platform-input" data-index="' + i + '" value="' + platforms[i] + '" maxlength="20" />' +
      '<button type="button" class="remove-btn" data-type="platform" data-index="' + i + '">✕</button>' +
      "</div>";
  }

  overlay.innerHTML =
    '<div class="modal-box modal-tall">' +
    '<div class="modal-header">' +
    "<h2>Settings</h2>" +
    '<button class="modal-close" id="closeSettings">✕</button>' +
    "</div>" +
    '<div class="modal-body modal-scroll">' +
    '<h3 class="modal-section-title">Rename Payment Sources</h3>' +
    '<div class="settings-field">' +
    "<label>💳 Source 1</label>" +
    '<input type="text" id="nameCard1" value="' + settings.sources.card1 + '" maxlength="20" />' +
    "</div>" +
    '<div class="settings-field">' +
    "<label>💳 Source 2</label>" +
    '<input type="text" id="nameCard2" value="' + settings.sources.card2 + '" maxlength="20" />' +
    "</div>" +
    '<div class="settings-field">' +
    "<label>🏦 Source 3</label>" +
    '<input type="text" id="nameBank" value="' + settings.sources.bank + '" maxlength="20" />' +
    "</div>" +
    '<div class="settings-field">' +
    "<label>👛 Source 4</label>" +
    '<input type="text" id="nameWallet" value="' + settings.sources.wallet + '" maxlength="20" />' +
    "</div>" +
    '<div class="settings-divider"></div>' +
    '<h3 class="modal-section-title">Manage People</h3>' +
    '<div id="namesList">' + namesListHtml + "</div>" +
    '<div class="add-new-row">' +
    '<input type="text" id="newNameInput" placeholder="Add new person..." maxlength="20" />' +
    '<button type="button" class="add-btn" id="addNameBtn">+</button>' +
    "</div>" +
    '<div class="settings-divider"></div>' +
    '<h3 class="modal-section-title">Manage Platforms</h3>' +
    '<div id="platformsList">' + platformsListHtml + "</div>" +
    '<div class="add-new-row">' +
    '<input type="text" id="newPlatformInput" placeholder="Add new platform..." maxlength="20" />' +
    '<button type="button" class="add-btn" id="addPlatformBtn">+</button>' +
    "</div>" +
    "</div>" +
    '<div class="modal-footer">' +
    '<button class="btn-save" id="saveSettings">Save All Changes</button>' +
    '<div class="backup-section">' +
    '<div class="backup-divider"></div>' +
    '<h3 class="modal-section-title">Data Backup</h3>' +
    '<div class="backup-buttons">' +
    '<button type="button" class="backup-btn export-btn" id="exportBtn">📥 Export Backup</button>' +
    '<button type="button" class="backup-btn import-btn" id="importBtn">📤 Import Backup</button>' +
    '<input type="file" id="importFile" accept=".json" style="display:none" />' +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>";

  document.body.appendChild(overlay);

  document.getElementById("addNameBtn").addEventListener("click", function () {
    var input = document.getElementById("newNameInput");
    var val = input.value.trim();
    if (!val) return;

    var namesList = document.getElementById("namesList");
    var currentCount = namesList.querySelectorAll(".editable-item").length;

    var newItem = document.createElement("div");
    newItem.className = "editable-item";
    newItem.innerHTML =
      '<input type="text" class="edit-name-input" data-index="' + currentCount + '" value="' + val + '" maxlength="20" />' +
      '<button type="button" class="remove-btn" data-type="name" data-index="' + currentCount + '">✕</button>';
    namesList.appendChild(newItem);
    input.value = "";

    newItem.querySelector(".remove-btn").addEventListener("click", function () {
      newItem.remove();
    });
  });

  document.getElementById("addPlatformBtn").addEventListener("click", function () {
    var input = document.getElementById("newPlatformInput");
    var val = input.value.trim();
    if (!val) return;

    var platformsList = document.getElementById("platformsList");
    var currentCount = platformsList.querySelectorAll(".editable-item").length;

    var newItem = document.createElement("div");
    newItem.className = "editable-item";
    newItem.innerHTML =
      '<input type="text" class="edit-platform-input" data-index="' + currentCount + '" value="' + val + '" maxlength="20" />' +
      '<button type="button" class="remove-btn" data-type="platform" data-index="' + currentCount + '">✕</button>';
    platformsList.appendChild(newItem);
    input.value = "";

    newItem.querySelector(".remove-btn").addEventListener("click", function () {
      newItem.remove();
    });
  });

  overlay.querySelectorAll(".remove-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      btn.closest(".editable-item").remove();
    });
  });

  // Export
  document.getElementById("exportBtn").addEventListener("click", function () {
    var data = {
      settings: loadSettings(),
      names: loadNames(),
      platforms: loadPlatforms(),
      transactions: loadTransactions(),
      exportDate: new Date().toISOString()
    };

    var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;

    var now = new Date();
    var dateStr = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
    a.download = "KrrishsKhaata_backup_" + dateStr + ".json";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Import
  document.getElementById("importBtn").addEventListener("click", function () {
    document.getElementById("importFile").click();
  });

  document.getElementById("importFile").addEventListener("change", function (e) {
    var file = e.target.files[0];
    if (!file) return;

    var reader = new FileReader();
    reader.onload = function (event) {
      try {
        var data = JSON.parse(event.target.result);

        if (!data.transactions || !data.settings) {
          alert("Invalid backup file");
          return;
        }

        var confirmMsg = "This will replace ALL your current data with the backup.\n\n" +
          "Backup from: " + (data.exportDate ? new Date(data.exportDate).toLocaleDateString("en-IN") : "Unknown") + "\n" +
          "Transactions: " + data.transactions.length + "\n\n" +
          "Are you sure?";

        if (!confirm(confirmMsg)) return;

        saveSettings(data.settings);
        saveNames(data.names || defaultNames.slice());
        savePlatforms(data.platforms || defaultPlatforms.slice());
        saveTransactions(data.transactions);

        applySourceNames();
        updateHomeTotals();
        overlay.remove();

        alert("Backup restored successfully!");
      } catch (err) {
        alert("Error reading backup file. Make sure it is a valid Krrish's Khaata backup.");
      }
    };
    reader.readAsText(file);
  });

  document.getElementById("closeSettings").addEventListener("click", function () {
    overlay.remove();
  });

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) overlay.remove();
  });

  document.getElementById("saveSettings").addEventListener("click", function () {
    var newSettings = loadSettings();
    newSettings.sources.card1 = document.getElementById("nameCard1").value.trim() || "Card 1";
    newSettings.sources.card2 = document.getElementById("nameCard2").value.trim() || "Card 2";
    newSettings.sources.bank = document.getElementById("nameBank").value.trim() || "Direct Bank";
    newSettings.sources.wallet = document.getElementById("nameWallet").value.trim() || "Wallet";
    saveSettings(newSettings);

    var nameInputs = document.querySelectorAll(".edit-name-input");
    var newNames = [];
    nameInputs.forEach(function (inp) {
      var v = inp.value.trim();
      if (v) newNames.push(v);
    });
    saveNames(newNames);

    var platInputs = document.querySelectorAll(".edit-platform-input");
    var newPlatforms = [];
    platInputs.forEach(function (inp) {
      var v = inp.value.trim();
      if (v) newPlatforms.push(v);
    });
    savePlatforms(newPlatforms);

    applySourceNames();
    overlay.remove();
  });
}

// ===== SUMMARY MODAL =====
function createSummaryModal() {
  var existing = document.getElementById("summaryModal");
  if (existing) existing.remove();

  var settings = loadSettings();
  var transactions = loadTransactions();

  var overlay = document.createElement("div");
  overlay.id = "summaryModal";
  overlay.className = "modal-overlay";

  var months = {};
  transactions.forEach(function (t) {
    var d = new Date(t.dateTime);
    var key = d.getFullYear() + "-" + String(d.getMonth()).padStart(2, "0");
    var label = d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    months[key] = label;
  });

  var now = new Date();
  var currentKey = now.getFullYear() + "-" + String(now.getMonth()).padStart(2, "0");
  var currentLabel = now.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  if (!months[currentKey]) {
    months[currentKey] = currentLabel;
  }

  var sortedKeys = Object.keys(months).sort().reverse();

  var monthOptionsHtml = "";
  sortedKeys.forEach(function (key) {
    var sel = key === currentKey ? "selected" : "";
    monthOptionsHtml += '<option value="' + key + '" ' + sel + ">" + months[key] + "</option>";
  });

  overlay.innerHTML =
    '<div class="modal-box modal-tall">' +
    '<div class="modal-header">' +
    "<h2>Monthly Summary</h2>" +
    '<button class="modal-close" id="closeSummary">✕</button>' +
    "</div>" +
    '<div class="summary-body">' +
    '<div class="summary-month-select">' +
    "<label>Month:</label>" +
    '<select id="summaryMonth">' + monthOptionsHtml + "</select>" +
    "</div>" +
    '<div id="summaryContent"></div>' +
    "</div>" +
    "</div>";

  document.body.appendChild(overlay);

  function renderSummary(monthKey) {
    var filtered = transactions.filter(function (t) {
      var d = new Date(t.dateTime);
      var key = d.getFullYear() + "-" + String(d.getMonth()).padStart(2, "0");
      return key === monthKey;
    });

    var container = document.getElementById("summaryContent");

    if (filtered.length === 0) {
      container.innerHTML =
        '<div class="empty-state">' +
        '<span class="empty-icon">📭</span>' +
        "<p>No transactions this month</p>" +
        "</div>";
      return;
    }

    var householdTotal = 0;
    var personalOtherTotal = 0;
    var personalSelfTotal = 0;
    var grandTotal = 0;

    filtered.forEach(function (t) {
      var amt = Number(t.amount);
      grandTotal += amt;
      if (t.category === "household") householdTotal += amt;
      else if (t.category === "personal_other") personalOtherTotal += amt;
      else if (t.category === "personal_self") personalSelfTotal += amt;
    });

    var sourceTotals = {};
    var sKeys = Object.keys(settings.sources);
    sKeys.forEach(function (k) { sourceTotals[k] = 0; });

    filtered.forEach(function (t) {
      if (sourceTotals.hasOwnProperty(t.source)) {
        sourceTotals[t.source] += Number(t.amount);
      }
    });

    var personTotals = {};
    filtered.forEach(function (t) {
      if (t.category === "personal_other" && t.personName) {
        if (!personTotals[t.personName]) personTotals[t.personName] = 0;
        personTotals[t.personName] += Number(t.amount);
      }
    });

    var matchedCount = 0;
    var unmatchedCount = 0;
    filtered.forEach(function (t) {
      if (t.matched) matchedCount++;
      else unmatchedCount++;
    });

    var html = "";

    html +=
      '<div class="summary-block">' +
      '<div class="summary-block-title">Category Breakdown</div>' +
      '<div class="summary-line">' +
      '<span class="summary-line-label">🏠 Household</span>' +
      '<span class="summary-line-value">₹' + householdTotal.toLocaleString("en-IN") + "</span>" +
      "</div>" +
      '<div class="summary-line">' +
      '<span class="summary-line-label">👤 Someone\'s Personal</span>' +
      '<span class="summary-line-value">₹' + personalOtherTotal.toLocaleString("en-IN") + "</span>" +
      "</div>" +
      '<div class="summary-line">' +
      '<span class="summary-line-label">🙋 My Personal</span>' +
      '<span class="summary-line-value">₹' + personalSelfTotal.toLocaleString("en-IN") + "</span>" +
      "</div>" +
      '<div class="summary-line summary-line-total">' +
      '<span class="summary-line-label">Total Spent</span>' +
      '<span class="summary-line-value">₹' + grandTotal.toLocaleString("en-IN") + "</span>" +
      "</div>" +
      "</div>";

    html += '<div class="summary-block">' +
      '<div class="summary-block-title">Source Breakdown</div>';
    sKeys.forEach(function (k) {
      html +=
        '<div class="summary-line">' +
        '<span class="summary-line-label">' + settings.sources[k] + "</span>" +
        '<span class="summary-line-value">₹' + sourceTotals[k].toLocaleString("en-IN") + "</span>" +
        "</div>";
    });
    html += "</div>";

    var personNames = Object.keys(personTotals);
    if (personNames.length > 0) {
      html += '<div class="summary-block">' +
        '<div class="summary-block-title">Collect from Others</div>';
      personNames.forEach(function (name) {
        html +=
          '<div class="summary-line">' +
          '<span class="summary-line-label">👤 ' + name + "</span>" +
          '<span class="summary-line-value summary-line-owe">₹' + personTotals[name].toLocaleString("en-IN") + "</span>" +
          "</div>";
      });
      html +=
        '<div class="summary-line summary-line-total">' +
        '<span class="summary-line-label">Total to Collect</span>' +
        '<span class="summary-line-value summary-line-owe">₹' + personalOtherTotal.toLocaleString("en-IN") + "</span>" +
        "</div>" +
        "</div>";
    }

    html +=
      '<div class="summary-block">' +
      '<div class="summary-block-title">Amount to Ask from Father</div>' +
      '<div class="summary-line">' +
      '<span class="summary-line-label">🏠 Household</span>' +
      '<span class="summary-line-value">₹' + householdTotal.toLocaleString("en-IN") + "</span>" +
      "</div>" +
      '<div class="summary-line summary-line-total">' +
      '<span class="summary-line-label">Total from Father</span>' +
      '<span class="summary-line-value">₹' + householdTotal.toLocaleString("en-IN") + "</span>" +
      "</div>" +
      "</div>";

    html +=
      '<div class="summary-block">' +
      '<div class="summary-block-title">Statement Matching</div>' +
      '<div class="summary-line">' +
      '<span class="summary-line-label">✅ Matched</span>' +
      '<span class="summary-line-value">' + matchedCount + "</span>" +
      "</div>" +
      '<div class="summary-line">' +
      '<span class="summary-line-label">⚠️ Unmatched</span>' +
      '<span class="summary-line-value summary-line-owe">' + unmatchedCount + "</span>" +
      "</div>" +
      '<div class="summary-line">' +
      '<span class="summary-line-label">Total</span>' +
      '<span class="summary-line-value">' + filtered.length + "</span>" +
      "</div>" +
      "</div>";

    container.innerHTML = html;
  }

  renderSummary(currentKey);

  document.getElementById("summaryMonth").addEventListener("change", function () {
    renderSummary(this.value);
  });

  document.getElementById("closeSummary").addEventListener("click", function () {
    overlay.remove();
  });

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) overlay.remove();
  });
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", function () {
  applySourceNames();
  updateHomeTotals();

  document.getElementById("settingsBtn").addEventListener("click", function () {
    createSettingsModal();
  });

  document.getElementById("summaryBtn").addEventListener("click", function () {
    createSummaryModal();
  });

  document.getElementById("fabBtn").addEventListener("click", function () {
    createAddTransactionModal(null);
  });

  var sourceCards = document.querySelectorAll(".source-card");
  sourceCards.forEach(function (card) {
    card.addEventListener("click", function () {
      var source = card.getAttribute("data-source");
      createAddTransactionModal(source);
    });
  });

  document.getElementById("viewAllBtn").addEventListener("click", function () {
    openAllTransactions();
  });

  document.getElementById("backToHome").addEventListener("click", function () {
    showScreen("homeScreen");
    updateHomeTotals();
  });

  document.getElementById("filterMonth").addEventListener("change", applyFilters);
  document.getElementById("filterSource").addEventListener("change", applyFilters);
  document.getElementById("filterCategory").addEventListener("change", applyFilters);
  document.getElementById("filterStatus").addEventListener("change", applyFilters);
});