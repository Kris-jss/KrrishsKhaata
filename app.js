// ===== DEFAULT DATA =====
var defaultSources = [
  { id: "card1", emoji: "💳", name: "Card 1" },
  { id: "card2", emoji: "💳", name: "Card 2" },
  { id: "bank", emoji: "🏦", name: "Direct Bank" },
  { id: "wallet", emoji: "👛", name: "Wallet" }
];

var defaultNames = ["Father", "Mother", "Sister", "Brother", "Dadi", "Chachu", "Bua", "Self"];
var defaultPlatforms = ["Flipkart", "Amazon", "Swiggy", "Zepto", "BigBasket"];
var emojiOptions = ["💳", "🏦", "👛", "💵", "📱"];

// ===== STORAGE FUNCTIONS =====
function loadSources() {
  var saved = localStorage.getItem("kk_sources");
  if (saved) return JSON.parse(saved);
  return JSON.parse(JSON.stringify(defaultSources));
}

function saveSources(sources) {
  localStorage.setItem("kk_sources", JSON.stringify(sources));
}

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

function loadTransactions() {
  var saved = localStorage.getItem("kk_transactions");
  if (saved) return JSON.parse(saved);
  return [];
}

function saveTransactions(transactions) {
  localStorage.setItem("kk_transactions", JSON.stringify(transactions));
}

function getSourceName(sourceId) {
  var sources = loadSources();
  for (var i = 0; i < sources.length; i++) {
    if (sources[i].id === sourceId) return sources[i].name;
  }
  return sourceId;
}

function getSourceEmoji(sourceId) {
  var sources = loadSources();
  for (var i = 0; i < sources.length; i++) {
    if (sources[i].id === sourceId) return sources[i].emoji;
  }
  return "💳";
}

// ===== CALCULATOR MODE STATE =====
var calcMode = false;
var calcSelectedIds = [];

function toggleCalcMode() {
  calcMode = !calcMode;
  calcSelectedIds = [];
  updateCalcBar();
  applyFilters();

  var calcBtn = document.getElementById("calcModeBtn");
  if (calcMode) {
    calcBtn.style.background = "rgba(255,255,255,0.4)";
  } else {
    calcBtn.style.background = "rgba(255,255,255,0.15)";
  }
}

function updateCalcBar() {
  var bar = document.getElementById("calcBar");
  if (!calcMode) {
    bar.classList.add("calc-bar-hidden");
    return;
  }
  bar.classList.remove("calc-bar-hidden");

  var transactions = loadTransactions();
  var total = 0;
  var count = 0;

  calcSelectedIds.forEach(function (id) {
    for (var i = 0; i < transactions.length; i++) {
      if (transactions[i].id === id) {
        total += Number(transactions[i].amount);
        count++;
        break;
      }
    }
  });

  document.getElementById("calcCount").textContent = count + " selected";
  document.getElementById("calcTotal").textContent = "₹" + total.toLocaleString("en-IN");
}

// ===== WHATSAPP REMIND =====
function sendWhatsAppReminder(txn) {
  var d = new Date(txn.dateTime);
  var dateStr = d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  var amount = Number(txn.amount).toLocaleString("en-IN");
  var name = txn.personName || "there";
  var message = "";

  if (txn.category === "direct_credit") {
    message = "Hey " + name + ", I had lent you ₹" + amount + " on " + dateStr + ". Kindly settle when convenient 🙂";
  } else {
    var items = txn.items || "an item";
    // Handle multi-person
    var names = name.split(", ");
    if (names.length > 1) {
      var firstName = names[0];
      var others = names.slice(1).join(", ");
      message = "Hey " + firstName + ", you and " + others + " asked me to order " + items + " on " + dateStr + ". The amount for it was ₹" + amount + ". Please settle when convenient 🙏";
    } else {
      message = "Hey " + name + ", you had asked me to order " + items + " on " + dateStr + ". The amount for it was ₹" + amount + ". Please settle when convenient 🙏";
    }
  }

  var url = "https://wa.me/?text=" + encodeURIComponent(message);
  window.open(url, "_blank");
}

// ===== RENDER SOURCE GRID =====
function renderSourceGrid() {
  var sources = loadSources();
  var transactions = loadTransactions();
  var now = new Date();
  var currentMonth = now.getMonth();
  var currentYear = now.getFullYear();

  var thisMonth = transactions.filter(function (t) {
    var d = new Date(t.dateTime);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  var sourceTotals = {};
  sources.forEach(function (s) { sourceTotals[s.id] = 0; });

  thisMonth.forEach(function (t) {
    if (sourceTotals.hasOwnProperty(t.source)) {
      sourceTotals[t.source] += Number(t.amount);
    }
  });

  var grid = document.getElementById("sourceGrid");
  var html = "";

  sources.forEach(function (s) {
    html +=
      '<button class="source-card" data-source="' + s.id + '">' +
      '<span class="source-icon">' + s.emoji + "</span>" +
      '<span class="source-name">' + s.name + "</span>" +
      '<span class="source-total">₹' + (sourceTotals[s.id] || 0).toLocaleString("en-IN") + "</span>" +
      "</button>";
  });

  grid.innerHTML = html;

  grid.querySelectorAll(".source-card").forEach(function (card) {
    card.addEventListener("click", function () {
      var source = card.getAttribute("data-source");
      createAddTransactionModal(source, null);
    });
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
  thisMonth.forEach(function (t) { monthTotal += Number(t.amount); });

  document.getElementById("monthTotal").textContent = "₹" + monthTotal.toLocaleString("en-IN");
  document.getElementById("monthCount").textContent = thisMonth.length;

  renderSourceGrid();
  updateRecentList(thisMonth);
}

// ===== CATEGORY HELPERS =====
var categoryColors = {
  household: "#235347",
  personal_other: "#7da0ca",
  personal_self: "#8eb69b",
  direct_credit: "#c0392b"
};

function getCategoryLabel(t) {
  if (t.category === "household") return "🏠 Household";
  if (t.category === "personal_self") return "🙋 My Personal";
  if (t.category === "direct_credit") return "🤝 Credit · " + (t.personName || "Someone");
  return "👤 " + (t.personName || "Someone");
}

// ===== UPDATE RECENT LIST =====
function updateRecentList(transactions) {
  var container = document.getElementById("recentList");

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
  var html = "";

  recent.forEach(function (t) {
    var d = new Date(t.dateTime);
    var dateStr = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    var timeStr = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    var sourceName = getSourceName(t.source);
    var catColor = categoryColors[t.category] || "#235347";
    var catLabel = getCategoryLabel(t);

    var itemsDisplay = t.items || "No details";
    if (t.category === "direct_credit") {
      itemsDisplay = t.mode ? ("Via " + t.mode) : "Direct Credit";
      if (t.items) itemsDisplay += " · " + t.items;
    }

    var actionBtns = '<button class="edit-btn" data-id="' + t.id + '" title="Edit">✏️</button>';
    if (t.category === "personal_other" || t.category === "direct_credit") {
      actionBtns += '<button class="wa-btn" data-id="' + t.id + '" title="Remind via WhatsApp">💬</button>';
    }

    var isResolved = t.category === "direct_credit" ? t.settled : t.matched;

    html +=
      '<div class="txn-item ' + (isResolved ? "txn-matched" : "") + '">' +
      '<div class="txn-left">' +
      '<div class="txn-category-dot" style="background:' + catColor + '"></div>' +
      '<div class="txn-details">' +
      '<span class="txn-items">' + itemsDisplay + "</span>" +
      '<span class="txn-meta">' + catLabel + " · " + sourceName + "</span>" +
      '<span class="txn-meta">' + dateStr + " · " + timeStr + "</span>" +
      "</div>" +
      "</div>" +
      '<div class="txn-right">' +
      '<span class="txn-amount">₹' + Number(t.amount).toLocaleString("en-IN") + "</span>" +
      '<div class="txn-actions">' + actionBtns + "</div>" +
      "</div>" +
      "</div>";
  });

  container.innerHTML = html;

  container.querySelectorAll(".edit-btn").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var id = btn.getAttribute("data-id");
      var allTxns = loadTransactions();
      for (var i = 0; i < allTxns.length; i++) {
        if (allTxns[i].id === id) {
          createAddTransactionModal(null, allTxns[i]);
          break;
        }
      }
    });
  });

  container.querySelectorAll(".wa-btn").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
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
  calcMode = false;
  calcSelectedIds = [];
  updateCalcBar();
  var calcBtn = document.getElementById("calcModeBtn");
  calcBtn.style.background = "rgba(255,255,255,0.15)";

  document.getElementById("searchInput").value = "";
  document.getElementById("searchClear").classList.remove("visible");

  showScreen("allTxnScreen");
  populateFilters();
  applyFilters();
}

function populateFilters() {
  var sources = loadSources();
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
  if (!months[currentKey]) months[currentKey] = currentLabel;

  var sortedKeys = Object.keys(months).sort().reverse();
  var monthHtml = '<option value="all">All Months</option>';
  sortedKeys.forEach(function (key) {
    var sel = key === currentKey ? "selected" : "";
    monthHtml += '<option value="' + key + '" ' + sel + ">" + months[key] + "</option>";
  });
  monthSelect.innerHTML = monthHtml;

  var sourceSelect = document.getElementById("filterSource");
  var sourceHtml = '<option value="all">All Sources</option>';
  sources.forEach(function (s) {
    sourceHtml += '<option value="' + s.id + '">' + s.emoji + " " + s.name + "</option>";
  });
  sourceSelect.innerHTML = sourceHtml;
}

function applyFilters() {
  var transactions = loadTransactions();
  var searchVal = (document.getElementById("searchInput").value || "").trim().toLowerCase();

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

    if (statusVal === "matched") {
      if (t.category === "direct_credit" && !t.settled) return false;
      if (t.category !== "direct_credit" && !t.matched) return false;
    }
    if (statusVal === "unmatched") {
      if (t.category === "direct_credit" && t.settled) return false;
      if (t.category !== "direct_credit" && t.matched) return false;
    }

    // Search
    if (searchVal) {
      var haystack = [
        t.personName || "",
        t.items || "",
        t.platform || "",
        t.mode || "",
        String(t.amount),
        getSourceName(t.source)
      ].join(" ").toLowerCase();

      if (haystack.indexOf(searchVal) === -1) return false;
    }

    return true;
  });

  filtered.sort(function (a, b) {
    return new Date(b.dateTime) - new Date(a.dateTime);
  });

  var total = 0;
  var pendingCount = 0;
  filtered.forEach(function (t) {
    total += Number(t.amount);
    if (t.category === "direct_credit" && !t.settled) pendingCount++;
    else if (t.category !== "direct_credit" && !t.matched) pendingCount++;
  });

  document.getElementById("filteredTotal").textContent = "₹" + total.toLocaleString("en-IN");
  document.getElementById("filteredCount").textContent = filtered.length;
  document.getElementById("unmatchedCount").textContent = pendingCount;

  var container = document.getElementById("allTxnList");

  if (filtered.length === 0) {
    container.innerHTML =
      '<div class="empty-state">' +
      '<span class="empty-icon">🔍</span>' +
      "<p>No transactions found</p>" +
      "</div>";
    return;
  }

  var html = "";
  filtered.forEach(function (t) {
    var d = new Date(t.dateTime);
    var dateStr = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    var timeStr = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    var sourceName = getSourceName(t.source);
    var catColor = categoryColors[t.category] || "#235347";
    var catLabel = getCategoryLabel(t);

    var itemsDisplay = t.items || "No details";
    if (t.category === "direct_credit") {
      itemsDisplay = t.mode ? ("Via " + t.mode) : "Direct Credit";
      if (t.items) itemsDisplay += " · " + t.items;
    }

    var isResolved = t.category === "direct_credit" ? t.settled : t.matched;

    if (calcMode) {
      var isCalcSelected = calcSelectedIds.indexOf(t.id) !== -1;
      html +=
        '<div class="txn-item-full" data-calc-id="' + t.id + '">' +
        '<div class="calc-select ' + (isCalcSelected ? "calc-selected" : "") + '" data-id="' + t.id + '"></div>' +
        '<div class="txn-content">' +
        '<div class="txn-left">' +
        '<div class="txn-category-dot" style="background:' + catColor + '"></div>' +
        '<div class="txn-details">' +
        '<span class="txn-items">' + itemsDisplay + "</span>" +
        '<span class="txn-meta">' + catLabel + " · " + sourceName + "</span>" +
        '<span class="txn-meta">' + dateStr + " · " + timeStr + "</span>" +
        "</div>" +
        "</div>" +
        '<div class="txn-right">' +
        '<span class="txn-amount">₹' + Number(t.amount).toLocaleString("en-IN") + "</span>" +
        "</div>" +
        "</div>" +
        "</div>";
    } else {
      var actionBtns = '<button class="edit-btn" data-id="' + t.id + '" title="Edit">✏️</button>';
      if (t.category === "personal_other" || t.category === "direct_credit") {
        actionBtns += '<button class="wa-btn" data-id="' + t.id + '" title="Remind">💬</button>';
      }
      actionBtns += '<button class="delete-btn" data-id="' + t.id + '" title="Delete">🗑️</button>';

      html +=
        '<div class="txn-item-full ' + (isResolved ? "txn-matched-full" : "") + '">' +
        '<input type="checkbox" class="txn-checkbox" data-id="' + t.id + '" data-type="' + (t.category === "direct_credit" ? "settled" : "matched") + '" ' + (isResolved ? "checked" : "") + " />" +
        '<div class="txn-content">' +
        '<div class="txn-left">' +
        '<div class="txn-category-dot" style="background:' + catColor + '"></div>' +
        '<div class="txn-details">' +
        '<span class="txn-items">' + itemsDisplay + "</span>" +
        '<span class="txn-meta">' + catLabel + " · " + sourceName + "</span>" +
        '<span class="txn-meta">' + dateStr + " · " + timeStr + "</span>" +
        "</div>" +
        "</div>" +
        '<div class="txn-right">' +
        '<span class="txn-amount">₹' + Number(t.amount).toLocaleString("en-IN") + "</span>" +
        '<div class="txn-actions">' + actionBtns + "</div>" +
        "</div>" +
        "</div>" +
        "</div>";
    }
  });

  container.innerHTML = html;

  if (calcMode) {
    container.querySelectorAll(".calc-select").forEach(function (dot) {
      dot.addEventListener("click", function () {
        var id = dot.getAttribute("data-id");
        var idx = calcSelectedIds.indexOf(id);
        if (idx === -1) {
          calcSelectedIds.push(id);
          dot.classList.add("calc-selected");
        } else {
          calcSelectedIds.splice(idx, 1);
          dot.classList.remove("calc-selected");
        }
        updateCalcBar();
      });
    });
  } else {
    // Edit buttons
    container.querySelectorAll(".edit-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-id");
        var allTxns = loadTransactions();
        for (var i = 0; i < allTxns.length; i++) {
          if (allTxns[i].id === id) {
            createAddTransactionModal(null, allTxns[i]);
            break;
          }
        }
      });
    });

    // WhatsApp buttons
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
          "Amount: ₹" + Number(txnToDelete.amount).toLocaleString("en-IN") + "\n" +
          "Date: " + new Date(txnToDelete.dateTime).toLocaleDateString("en-IN") + "\n\n" +
          "This cannot be undone.";

        if (!confirm(confirmMsg)) return;

        var updatedTxns = allTxns.filter(function (t) { return t.id !== id; });
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
        var type = cb.getAttribute("data-type");
        var allTxns = loadTransactions();

        for (var i = 0; i < allTxns.length; i++) {
          if (allTxns[i].id === id) {
            if (type === "settled") {
              allTxns[i].settled = cb.checked;
            } else {
              allTxns[i].matched = cb.checked;
            }
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
}

// ===== ADD / EDIT TRANSACTION MODAL =====
function createAddTransactionModal(preSelectedSource, editTxn) {
  var existing = document.getElementById("addTxnModal");
  if (existing) existing.remove();

  var sources = loadSources();
  var names = loadNames();
  var platforms = loadPlatforms();
  var isEdit = editTxn !== null && editTxn !== undefined;

  var overlay = document.createElement("div");
  overlay.id = "addTxnModal";
  overlay.className = "modal-overlay";

  var sourceOptionsHtml = "";
  sources.forEach(function (s) {
    var selected = "";
    if (isEdit && editTxn.source === s.id) selected = "selected";
    else if (!isEdit && preSelectedSource === s.id) selected = "selected";
    sourceOptionsHtml += '<option value="' + s.id + '" ' + selected + ">" + s.emoji + " " + s.name + "</option>";
  });

  // Multi-person: parse existing personName
  var existingPersons = [];
  if (isEdit && editTxn.personName) {
    existingPersons = editTxn.personName.split(", ");
  }

  var nameChipsHtml = "";
  for (var i = 0; i < names.length; i++) {
    var nameActive = existingPersons.indexOf(names[i]) !== -1 ? " chip-active" : "";
    nameChipsHtml += '<button type="button" class="chip' + nameActive + '" data-value="' + names[i] + '">' + names[i] + "</button>";
  }

  var platformChipsHtml = "";
  for (var i = 0; i < platforms.length; i++) {
    var platActive = isEdit && editTxn.platform === platforms[i] ? " chip-active" : "";
    platformChipsHtml += '<button type="button" class="chip' + platActive + '" data-value="' + platforms[i] + '">' + platforms[i] + "</button>";
  }

  var platformValue = isEdit && editTxn.platform ? editTxn.platform : "";
  var itemsValue = isEdit && editTxn.items ? editTxn.items : "";
  var amountValue = isEdit ? editTxn.amount : "";

  // Check if there's a custom person not in presets
  var customPersons = [];
  if (isEdit && editTxn.personName) {
    existingPersons.forEach(function (p) {
      if (names.indexOf(p) === -1 && p !== "Self") {
        customPersons.push(p);
      }
    });
  }

  var isCustomPlatform = isEdit && platformValue && platforms.indexOf(platformValue) === -1;

  var headerText = isEdit ? "Edit Transaction" : "Add Transaction";
  var saveText = isEdit ? "Save Changes" : "Save Transaction";

  overlay.innerHTML =
    '<div class="modal-box modal-tall">' +
    '<div class="modal-header">' +
    "<h2>" + headerText + "</h2>" +
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
    '<button type="button" class="category-btn" data-cat="direct_credit">🤝 Direct Credit</button>' +
    "</div>" +
    "</div>" +
    '<div class="form-field" id="personField">' +
    "<label>Who asked / For whom</label>" +
    '<p class="multi-hint">You can select multiple people</p>' +
    '<div class="chip-container" id="nameChips">' + nameChipsHtml + "</div>" +
    '<input type="text" id="txnPerson" placeholder="Or type a name..." value="' + customPersons.join(", ") + '" />' +
    "</div>" +
    '<div class="form-field" id="modeField" style="display:none">' +
    "<label>Mode</label>" +
    '<div class="mode-grid">' +
    '<button type="button" class="mode-btn" data-mode="Cash">💵 Cash</button>' +
    '<button type="button" class="mode-btn" data-mode="UPI">📱 UPI</button>' +
    '<button type="button" class="mode-btn" data-mode="Bank Transfer">🏦 Bank</button>' +
    "</div>" +
    "</div>" +
    '<div class="form-field" id="platformField">' +
    "<label>Platform</label>" +
    '<div class="chip-container" id="platformChips">' + platformChipsHtml + "</div>" +
    '<input type="text" id="txnPlatform" placeholder="Or type platform name..." value="' + (isCustomPlatform ? platformValue : "") + '" />' +
    "</div>" +
    '<div class="form-field">' +
    '<label id="itemsLabel">What was ordered</label>' +
    '<input type="text" id="txnItems" placeholder="e.g. Milk, Potato, Shampoo" value="' + itemsValue + '" />' +
    "</div>" +
    '<div class="form-field">' +
    "<label>Amount (₹)</label>" +
    '<input type="number" id="txnAmount" placeholder="e.g. 350" inputmode="numeric" value="' + amountValue + '" />' +
    "</div>" +
    '<div class="form-field">' +
    "<label>Date & Time</label>" +
    '<input type="datetime-local" id="txnDateTime" />' +
    "</div>" +
    "</div>" +
    '<div class="modal-footer">' +
    '<button class="btn-save" id="saveTxn">' + saveText + "</button>" +
    "</div>" +
    "</div>";

  document.body.appendChild(overlay);

  // Set date-time
  if (isEdit) {
    var editDate = new Date(editTxn.dateTime);
    var offset = editDate.getTimezoneOffset() * 60000;
    var local = new Date(editDate - offset);
    document.getElementById("txnDateTime").value = local.toISOString().slice(0, 16);
  } else {
    var now = new Date();
    var offset = now.getTimezoneOffset() * 60000;
    var local = new Date(now - offset);
    document.getElementById("txnDateTime").value = local.toISOString().slice(0, 16);
  }

  var selectedCategory = isEdit ? editTxn.category : null;
  var selectedMode = isEdit && editTxn.mode ? editTxn.mode : null;

  var catBtns = overlay.querySelectorAll(".category-btn");

  function updateFieldsForCategory(cat) {
    var personField = document.getElementById("personField");
    var platformField = document.getElementById("platformField");
    var modeField = document.getElementById("modeField");
    var itemsLabel = document.getElementById("itemsLabel");

    if (cat === "personal_self") {
      personField.style.display = "none";
      platformField.style.display = "flex";
      modeField.style.display = "none";
      itemsLabel.textContent = "What was ordered";
    } else if (cat === "direct_credit") {
      personField.style.display = "flex";
      platformField.style.display = "none";
      modeField.style.display = "flex";
      itemsLabel.textContent = "Note (optional)";
    } else {
      personField.style.display = "flex";
      platformField.style.display = "flex";
      modeField.style.display = "none";
      itemsLabel.textContent = "What was ordered";
    }
  }

  if (isEdit) {
    catBtns.forEach(function (btn) {
      if (btn.getAttribute("data-cat") === editTxn.category) {
        btn.classList.add("chip-active");
      }
    });
    updateFieldsForCategory(editTxn.category);
  }

  if (isEdit && editTxn.mode) {
    overlay.querySelectorAll(".mode-btn").forEach(function (btn) {
      if (btn.getAttribute("data-mode") === editTxn.mode) {
        btn.classList.add("chip-active");
      }
    });
  }

  catBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      catBtns.forEach(function (b) { b.classList.remove("chip-active"); });
      btn.classList.add("chip-active");
      selectedCategory = btn.getAttribute("data-cat");
      updateFieldsForCategory(selectedCategory);
    });
  });

  var modeBtns = overlay.querySelectorAll(".mode-btn");
  modeBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      modeBtns.forEach(function (b) { b.classList.remove("chip-active"); });
      btn.classList.add("chip-active");
      selectedMode = btn.getAttribute("data-mode");
    });
  });

  // MULTI-SELECT name chips
  var nameChipBtns = overlay.querySelectorAll("#nameChips .chip");
  var txnPersonInput = document.getElementById("txnPerson");

  nameChipBtns.forEach(function (chip) {
    chip.addEventListener("click", function () {
      // Toggle this chip
      chip.classList.toggle("chip-active");
      // Clear text input when using chips
      txnPersonInput.value = "";
    });
  });

  txnPersonInput.addEventListener("input", function () {
    if (txnPersonInput.value.trim() !== "") {
      nameChipBtns.forEach(function (c) { c.classList.remove("chip-active"); });
    }
  });

  // Platform chips (single select)
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

  // Close
  document.getElementById("closeTxn").addEventListener("click", function () {
    overlay.remove();
  });

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) overlay.remove();
  });

  // Save
  document.getElementById("saveTxn").addEventListener("click", function () {
    var source = document.getElementById("txnSource").value;

    // Collect selected name chips
    var selectedNames = [];
    overlay.querySelectorAll("#nameChips .chip.chip-active").forEach(function (chip) {
      selectedNames.push(chip.getAttribute("data-value"));
    });

    // Also check text input
    var typedPerson = document.getElementById("txnPerson").value.trim();
    if (typedPerson) {
      selectedNames.push(typedPerson);
    }

    var personName = selectedNames.join(", ");

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
      alert("Please enter who this is for");
      return;
    }
    if (selectedCategory === "direct_credit" && !selectedMode) {
      alert("Please select a mode (Cash/UPI/Bank)");
      return;
    }

    var txn = {
      id: isEdit ? editTxn.id : Date.now().toString(),
      source: source,
      category: selectedCategory,
      personName: selectedCategory === "personal_self" ? "Self" : personName,
      platform: selectedCategory === "direct_credit" ? "" : platform,
      mode: selectedCategory === "direct_credit" ? selectedMode : "",
      items: items,
      amount: Number(amount),
      dateTime: dateTime,
      matched: isEdit ? editTxn.matched : false,
      settled: isEdit ? editTxn.settled : false
    };

    var transactions = loadTransactions();

    if (isEdit) {
      for (var i = 0; i < transactions.length; i++) {
        if (transactions[i].id === editTxn.id) {
          transactions[i] = txn;
          break;
        }
      }
    } else {
      transactions.push(txn);
    }

    saveTransactions(transactions);
    updateHomeTotals();

    if (!document.getElementById("allTxnScreen").classList.contains("screen-hidden")) {
      applyFilters();
    }

    overlay.remove();
  });
}

// ===== SETTINGS MODAL =====
function createSettingsModal() {
  var existing = document.getElementById("settingsModal");
  if (existing) existing.remove();

  var sources = loadSources();
  var names = loadNames();
  var platforms = loadPlatforms();

  var overlay = document.createElement("div");
  overlay.id = "settingsModal";
  overlay.className = "modal-overlay";

  var sourcesListHtml = "";
  sources.forEach(function (s, index) {
    var emojiPickerHtml = "";
    emojiOptions.forEach(function (em) {
      var activeClass = em === s.emoji ? " emoji-active" : "";
      emojiPickerHtml += '<button type="button" class="emoji-option' + activeClass + '" data-emoji="' + em + '">' + em + "</button>";
    });

    sourcesListHtml +=
      '<div class="source-edit-item" data-source-index="' + index + '">' +
      '<div class="source-emoji-picker">' + emojiPickerHtml + "</div>" +
      '<input type="text" class="source-name-input" value="' + s.name + '" maxlength="20" />' +
      '<button type="button" class="remove-btn remove-source-btn" data-index="' + index + '">✕</button>' +
      "</div>";
  });

  var namesListHtml = "";
  for (var i = 0; i < names.length; i++) {
    namesListHtml +=
      '<div class="editable-item">' +
      '<input type="text" class="edit-name-input" value="' + names[i] + '" maxlength="20" />' +
      '<button type="button" class="remove-btn">✕</button>' +
      "</div>";
  }

  var platformsListHtml = "";
  for (var i = 0; i < platforms.length; i++) {
    platformsListHtml +=
      '<div class="editable-item">' +
      '<input type="text" class="edit-platform-input" value="' + platforms[i] + '" maxlength="20" />' +
      '<button type="button" class="remove-btn">✕</button>' +
      "</div>";
  }

  overlay.innerHTML =
    '<div class="modal-box modal-tall">' +
    '<div class="modal-header">' +
    "<h2>Settings</h2>" +
    '<button class="modal-close" id="closeSettings">✕</button>' +
    "</div>" +
    '<div class="modal-body modal-scroll">' +
    '<h3 class="modal-section-title">Payment Sources</h3>' +
    '<div id="sourcesList">' + sourcesListHtml + "</div>" +
    '<div class="add-new-row">' +
    '<input type="text" id="newSourceInput" placeholder="Add new source..." maxlength="20" />' +
    '<button type="button" class="add-btn" id="addSourceBtn">+</button>' +
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

  function attachEmojiListeners(container) {
    container.querySelectorAll(".emoji-option").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var picker = btn.closest(".source-emoji-picker");
        picker.querySelectorAll(".emoji-option").forEach(function (b) { b.classList.remove("emoji-active"); });
        btn.classList.add("emoji-active");
      });
    });
  }

  attachEmojiListeners(overlay);

  function attachRemoveSourceListeners() {
    overlay.querySelectorAll(".remove-source-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var list = document.getElementById("sourcesList");
        if (list.querySelectorAll(".source-edit-item").length <= 1) {
          alert("You need at least one payment source");
          return;
        }
        btn.closest(".source-edit-item").remove();
      });
    });
  }

  attachRemoveSourceListeners();

  document.getElementById("addSourceBtn").addEventListener("click", function () {
    var input = document.getElementById("newSourceInput");
    var val = input.value.trim();
    if (!val) return;

    var emojiPickerHtml = "";
    emojiOptions.forEach(function (em, idx) {
      var activeClass = idx === 0 ? " emoji-active" : "";
      emojiPickerHtml += '<button type="button" class="emoji-option' + activeClass + '" data-emoji="' + em + '">' + em + "</button>";
    });

    var sourcesList = document.getElementById("sourcesList");
    var newItem = document.createElement("div");
    newItem.className = "source-edit-item";
    newItem.innerHTML =
      '<div class="source-emoji-picker">' + emojiPickerHtml + "</div>" +
      '<input type="text" class="source-name-input" value="' + val + '" maxlength="20" />' +
      '<button type="button" class="remove-btn remove-source-btn">✕</button>';
    sourcesList.appendChild(newItem);
    input.value = "";

    attachEmojiListeners(newItem);
    newItem.querySelector(".remove-source-btn").addEventListener("click", function () {
      var list = document.getElementById("sourcesList");
      if (list.querySelectorAll(".source-edit-item").length <= 1) {
        alert("You need at least one payment source");
        return;
      }
      newItem.remove();
    });
  });

  document.getElementById("addNameBtn").addEventListener("click", function () {
    var input = document.getElementById("newNameInput");
    var val = input.value.trim();
    if (!val) return;

    var namesList = document.getElementById("namesList");
    var newItem = document.createElement("div");
    newItem.className = "editable-item";
    newItem.innerHTML =
      '<input type="text" class="edit-name-input" value="' + val + '" maxlength="20" />' +
      '<button type="button" class="remove-btn">✕</button>';
    namesList.appendChild(newItem);
    input.value = "";

    newItem.querySelector(".remove-btn").addEventListener("click", function () { newItem.remove(); });
  });

  document.getElementById("addPlatformBtn").addEventListener("click", function () {
    var input = document.getElementById("newPlatformInput");
    var val = input.value.trim();
    if (!val) return;

    var platformsList = document.getElementById("platformsList");
    var newItem = document.createElement("div");
    newItem.className = "editable-item";
    newItem.innerHTML =
      '<input type="text" class="edit-platform-input" value="' + val + '" maxlength="20" />' +
      '<button type="button" class="remove-btn">✕</button>';
    platformsList.appendChild(newItem);
    input.value = "";

    newItem.querySelector(".remove-btn").addEventListener("click", function () { newItem.remove(); });
  });

  overlay.querySelectorAll("#namesList .remove-btn, #platformsList .remove-btn").forEach(function (btn) {
    btn.addEventListener("click", function () { btn.closest(".editable-item").remove(); });
  });

  // Export
  document.getElementById("exportBtn").addEventListener("click", function () {
    var data = {
      sources: loadSources(),
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

        if (!data.transactions) {
          alert("Invalid backup file");
          return;
        }

        var confirmMsg = "This will replace ALL your current data with the backup.\n\n" +
          "Backup from: " + (data.exportDate ? new Date(data.exportDate).toLocaleDateString("en-IN") : "Unknown") + "\n" +
          "Transactions: " + data.transactions.length + "\n\n" +
          "Are you sure?";

        if (!confirm(confirmMsg)) return;

        if (data.sources) saveSources(data.sources);
        if (data.names) saveNames(data.names);
        if (data.platforms) savePlatforms(data.platforms);
        saveTransactions(data.transactions);

        if (data.settings && !data.sources) {
          var oldSources = [];
          var keys = Object.keys(data.settings.sources);
          var defaultEmojis = { card1: "💳", card2: "💳", bank: "🏦", wallet: "👛" };
          keys.forEach(function (k) {
            oldSources.push({ id: k, emoji: defaultEmojis[k] || "💳", name: data.settings.sources[k] });
          });
          saveSources(oldSources);
        }

        updateHomeTotals();
        overlay.remove();
        alert("Backup restored successfully!");
      } catch (err) {
        alert("Error reading backup file.");
      }
    };
    reader.readAsText(file);
  });

  document.getElementById("closeSettings").addEventListener("click", function () { overlay.remove(); });

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) overlay.remove();
  });

  document.getElementById("saveSettings").addEventListener("click", function () {
    var newSources = [];
    var sourceItems = document.querySelectorAll(".source-edit-item");
    var existingSources = loadSources();

    sourceItems.forEach(function (item, index) {
      var activeEmoji = item.querySelector(".emoji-active");
      var emoji = activeEmoji ? activeEmoji.getAttribute("data-emoji") : "💳";
      var name = item.querySelector(".source-name-input").value.trim() || "Source";
      var existingId = existingSources[index] ? existingSources[index].id : "source_" + Date.now() + "_" + index;

      newSources.push({ id: existingId, emoji: emoji, name: name });
    });

    saveSources(newSources);

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

    updateHomeTotals();
    overlay.remove();
  });
}

// ===== SUMMARY MODAL =====
function createSummaryModal() {
  var existing = document.getElementById("summaryModal");
  if (existing) existing.remove();

  var sources = loadSources();
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
  if (!months[currentKey]) months[currentKey] = currentLabel;

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
    var directCreditTotal = 0;
    var grandTotal = 0;

    filtered.forEach(function (t) {
      var amt = Number(t.amount);
      grandTotal += amt;
      if (t.category === "household") householdTotal += amt;
      else if (t.category === "personal_other") personalOtherTotal += amt;
      else if (t.category === "personal_self") personalSelfTotal += amt;
      else if (t.category === "direct_credit") directCreditTotal += amt;
    });

    var sourceTotals = {};
    sources.forEach(function (s) { sourceTotals[s.id] = 0; });
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

    var creditPersonTotals = {};
    var creditPersonSettled = {};
    filtered.forEach(function (t) {
      if (t.category === "direct_credit" && t.personName) {
        if (!creditPersonTotals[t.personName]) {
          creditPersonTotals[t.personName] = 0;
          creditPersonSettled[t.personName] = 0;
        }
        creditPersonTotals[t.personName] += Number(t.amount);
        if (t.settled) creditPersonSettled[t.personName] += Number(t.amount);
      }
    });

    var matchedCount = 0;
    var unmatchedCount = 0;
    filtered.forEach(function (t) {
      if (t.category === "direct_credit") {
        if (t.settled) matchedCount++;
        else unmatchedCount++;
      } else {
        if (t.matched) matchedCount++;
        else unmatchedCount++;
      }
    });

    var html = "";

    html +=
      '<div class="summary-block">' +
      '<div class="summary-block-title">Category Breakdown</div>' +
      '<div class="summary-line"><span class="summary-line-label">🏠 Household</span><span class="summary-line-value">₹' + householdTotal.toLocaleString("en-IN") + "</span></div>" +
      '<div class="summary-line"><span class="summary-line-label">👤 Someone\'s Personal</span><span class="summary-line-value">₹' + personalOtherTotal.toLocaleString("en-IN") + "</span></div>" +
      '<div class="summary-line"><span class="summary-line-label">🙋 My Personal</span><span class="summary-line-value">₹' + personalSelfTotal.toLocaleString("en-IN") + "</span></div>" +
      '<div class="summary-line"><span class="summary-line-label">🤝 Direct Credit</span><span class="summary-line-value">₹' + directCreditTotal.toLocaleString("en-IN") + "</span></div>" +
      '<div class="summary-line summary-line-total"><span class="summary-line-label">Total</span><span class="summary-line-value">₹' + grandTotal.toLocaleString("en-IN") + "</span></div>" +
      "</div>";

    html += '<div class="summary-block"><div class="summary-block-title">Source Breakdown</div>';
    sources.forEach(function (s) {
      var val = sourceTotals[s.id] || 0;
      html += '<div class="summary-line"><span class="summary-line-label">' + s.emoji + " " + s.name + '</span><span class="summary-line-value">₹' + val.toLocaleString("en-IN") + "</span></div>";
    });
    html += "</div>";

    var personNames = Object.keys(personTotals);
    if (personNames.length > 0) {
      html += '<div class="summary-block"><div class="summary-block-title">Collect for Orders</div>';
      personNames.forEach(function (name) {
        html += '<div class="summary-line"><span class="summary-line-label">👤 ' + name + '</span><span class="summary-line-value summary-line-owe">₹' + personTotals[name].toLocaleString("en-IN") + "</span></div>";
      });
      html += '<div class="summary-line summary-line-total"><span class="summary-line-label">Total to Collect</span><span class="summary-line-value summary-line-owe">₹' + personalOtherTotal.toLocaleString("en-IN") + "</span></div></div>";
    }

    var creditNames = Object.keys(creditPersonTotals);
    if (creditNames.length > 0) {
      var totalUnsettled = 0;
      html += '<div class="summary-block"><div class="summary-block-title">Money Lent</div>';
      creditNames.forEach(function (name) {
        var unsettled = creditPersonTotals[name] - creditPersonSettled[name];
        totalUnsettled += unsettled;
        var statusLabel = unsettled > 0 ? " (₹" + unsettled.toLocaleString("en-IN") + " unsettled)" : " (settled)";
        html += '<div class="summary-line"><span class="summary-line-label">🤝 ' + name + statusLabel + '</span><span class="summary-line-value summary-line-owe">₹' + creditPersonTotals[name].toLocaleString("en-IN") + "</span></div>";
      });
      html += '<div class="summary-line summary-line-total"><span class="summary-line-label">Total Unsettled</span><span class="summary-line-value summary-line-owe">₹' + totalUnsettled.toLocaleString("en-IN") + "</span></div></div>";
    }

    html +=
      '<div class="summary-block"><div class="summary-block-title">Amount to Ask from Father</div>' +
      '<div class="summary-line"><span class="summary-line-label">🏠 Household</span><span class="summary-line-value">₹' + householdTotal.toLocaleString("en-IN") + "</span></div>" +
      '<div class="summary-line summary-line-total"><span class="summary-line-label">Total from Father</span><span class="summary-line-value">₹' + householdTotal.toLocaleString("en-IN") + "</span></div></div>";

    html +=
      '<div class="summary-block"><div class="summary-block-title">Reconciliation Status</div>' +
      '<div class="summary-line"><span class="summary-line-label">✅ Matched / Settled</span><span class="summary-line-value">' + matchedCount + "</span></div>" +
      '<div class="summary-line"><span class="summary-line-label">⚠️ Pending</span><span class="summary-line-value summary-line-owe">' + unmatchedCount + "</span></div>" +
      '<div class="summary-line"><span class="summary-line-label">Total</span><span class="summary-line-value">' + filtered.length + "</span></div></div>";

    container.innerHTML = html;
  }

  renderSummary(currentKey);

  document.getElementById("summaryMonth").addEventListener("change", function () { renderSummary(this.value); });

  document.getElementById("closeSummary").addEventListener("click", function () { overlay.remove(); });

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) overlay.remove();
  });
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", function () {
  var oldSettings = localStorage.getItem("kk_settings");
  var existingSources = localStorage.getItem("kk_sources");

  if (oldSettings && !existingSources) {
    var settings = JSON.parse(oldSettings);
    var defaultEmojis = { card1: "💳", card2: "💳", bank: "🏦", wallet: "👛" };
    var migratedSources = [];
    var keys = Object.keys(settings.sources);
    keys.forEach(function (k) {
      migratedSources.push({ id: k, emoji: defaultEmojis[k] || "💳", name: settings.sources[k] });
    });
    saveSources(migratedSources);
  }

  updateHomeTotals();

  document.getElementById("settingsBtn").addEventListener("click", function () { createSettingsModal(); });

  document.getElementById("summaryBtn").addEventListener("click", function () { createSummaryModal(); });

  document.getElementById("fabBtn").addEventListener("click", function () { createAddTransactionModal(null, null); });

  document.getElementById("viewAllBtn").addEventListener("click", function () { openAllTransactions(); });

  document.getElementById("backToHome").addEventListener("click", function () {
    calcMode = false;
    calcSelectedIds = [];
    updateCalcBar();
    showScreen("homeScreen");
    updateHomeTotals();
  });

  document.getElementById("filterMonth").addEventListener("change", applyFilters);
  document.getElementById("filterSource").addEventListener("change", applyFilters);
  document.getElementById("filterCategory").addEventListener("change", applyFilters);
  document.getElementById("filterStatus").addEventListener("change", applyFilters);

  // Search
  var searchInput = document.getElementById("searchInput");
  var searchClear = document.getElementById("searchClear");

  searchInput.addEventListener("input", function () {
    if (searchInput.value.trim()) {
      searchClear.classList.add("visible");
    } else {
      searchClear.classList.remove("visible");
    }
    applyFilters();
  });

  searchClear.addEventListener("click", function () {
    searchInput.value = "";
    searchClear.classList.remove("visible");
    applyFilters();
  });

  // Calculator mode
  document.getElementById("calcModeBtn").addEventListener("click", function () { toggleCalcMode(); });

  document.getElementById("calcDoneBtn").addEventListener("click", function () { toggleCalcMode(); });
});
