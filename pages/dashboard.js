// ===============================
// 1. IMPORTS
// ===============================
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { auth } from "../firebase.js";

import {
  collection,
  query,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

import { db } from "../firebase.js";
import { getTotals } from "../pages/transactions.logic.js";

import { initSidebar } from "../components/sidebar.js";
import { initTheme } from "../components/theme.js";

import {
  createUserIfNotExists,
  getUserData
} from "../userService.js";

initSidebar();
initTheme();


// ===============================
// 2. STATE (DASHBOARD ONLY)
// ===============================
let userId = null;

let transactions = [];
let budgets = [];
let goals = [];

let selectedMonth = new Date().toISOString().slice(0, 7);

const defaults = {
  transactions: [],
  budgets: {}
};

const incomeEl = document.getElementById("totalIncome");
const expenseEl = document.getElementById("totalExpense");
const balanceEl = document.getElementById("totalBalance");

const recentEl = document.getElementById("recentTransactions");

function setQuickMonth(type) {
  const now = new Date();

  if (type === "THIS") {
    selectedMonth = getMonthKey(now);
  }

  if (type === "LAST") {
    const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    selectedMonth = getMonthKey(last);
  }

  const monthPicker = document.querySelector(".month-picker");
  if (monthPicker) {
    monthPicker.value = selectedMonth;
  }

  renderUI();
}
// ===============================
// 3. AUTH + DATA LOAD
// ===============================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.replace("../index.html");
    return;
  }

  userId = user.uid;

  await createUserIfNotExists(user);

  const data = await getUserData(userId);

  const firstName = data?.firstName || "User";
  const userNameEl = document.getElementById("userName");

  if (userNameEl) {
    userNameEl.textContent =
      firstName.charAt(0).toUpperCase() + firstName.slice(1);
  }

  initDashboard(); // ✅ ONLY ONCE

  const txRef = collection(db, "users", userId, "transactions");

  onSnapshot(txRef, (snapshot) => {

    transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    renderUI();              
  });

  const bxRef = collection(db, "users", userId, "budgets");

  onSnapshot(bxRef, (snapshot) => {

    budgets= snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    renderUI();              
  });

  const gxRef = collection(db, "users", userId, "goals");

  onSnapshot(gxRef, (snapshot) => {

    goals= snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    renderUI();              
  });
});


// ===============================
// 4. INIT
// ===============================
function initDashboard() {
  attachEvents();
  renderUI();
}


// ===============================
// 5. EVENTS (MINIMAL)
// ===============================
function attachEvents() {
  const monthPicker = document.querySelector(".month-picker");
  if (monthPicker) {
    monthPicker.value = selectedMonth;
  }
  const thisBtn = document.querySelector(".quick-this");
  const lastBtn = document.querySelector(".quick-last");
  if (monthPicker) {
    monthPicker.addEventListener("change", (e) => {
      selectedMonth = e.target.value;
      renderUI();
    });
  }
  if (thisBtn) {
    thisBtn.addEventListener("click", () => setQuickMonth("THIS"));
  }

  if (lastBtn) {
    lastBtn.addEventListener("click", () => setQuickMonth("LAST"));
  }
}


// ===============================
// 6. CORE DASHBOARD RENDER
// ===============================
function renderUI() {
  renderStatsCards();
  renderRecentTransactions();
  renderBudgetSnapshot();
  renderAnalytics();
  renderChart();
  renderGoalsSnapshot();
}


// ===============================
// 7. STATS CARDS
// ===============================
function renderStatsCards() {
  const filtered = getFilteredTransactions();

  let income = 0;
  let expenses = 0;

  filtered.forEach(t => {
    if (t.type === "income") income += t.amount;
    if (t.type === "expense") expenses += t.amount;
  });

  const savings = income - expenses;

  setText(".income-value", income);
  setText(".expense-value", expenses);
  setText(".savings-value", savings);
  setText(".balance-value", savings);
}


// ===============================
// 8. RECENT TRANSACTIONS (TOP 3)
// ===============================
function renderRecentTransactions() {
  const body = document.querySelector(".recent-transactions-body");

  if (!body) return;

  const filtered = getFilteredRaw();

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
  );

  const recent = sorted.slice(0, 3);

  body.innerHTML = "";

  if (recent.length === 0) {
    body.innerHTML = `
      <tr>
        <td colspan="4">No transactions for this month</td>
      </tr>
    `;
    return;
  }

  recent.forEach(t => {
    const isIncome = t.type === "income";
    body.innerHTML += `
        <tr>
            <td>
                <div style="width:32px;height:32px;border-radius:50%;background:${isIncome ? '#e8f5ec' : '#fdf0ee'};display:flex;align-items:center;justify-content:center;">
                    <span class="material-symbols-rounded" style="font-size:16px;color:${isIncome ? '#1a7a3a' : '#c0392b'}">
                        ${isIncome ? 'arrow_downward' : 'arrow_upward'}
                    </span>
                </div>
            </td>
            <td>${t.description}</td>
            <td><span style="background:var(--color-hover-secondary);padding:3px 10px;border-radius:20px;font-size:0.75rem">${t.category}</span></td>
            <td style="font-size:0.78rem;color:var(--color-text-primary)">${t.date}</td>
            <td style="color:${isIncome ? '#1a7a3a' : '#c0392b'};font-weight:600">${isIncome ? '+' : '-'}R${t.amount}</td>
        </tr>
    `;
  });
}
// ===============================
// 9. CHART
// ===============================
function renderChart() {
  const ctx = document.getElementById("expenseChart");
  if (!ctx) return;

  const monthly = {};

  transactions.forEach(t => {
    if (!monthly[t.month]) {
      monthly[t.month] = { income: 0, expenses: 0 };
    }
    if (t.type === "income") monthly[t.month].income += t.amount;
    if (t.type === "expense") monthly[t.month].expenses += t.amount;
  });

  const labels = Object.keys(monthly).sort();
  const incomeData = labels.map(m => monthly[m].income);
  const expenseData = labels.map(m => monthly[m].expenses);

  if (window.dashboardChart) {
    window.dashboardChart.destroy();
  }

  window.dashboardChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Income",
          data: incomeData,
          backgroundColor: "#1a7a3a"
        },
        {
          label: "Expenses",
          data: expenseData,
          backgroundColor: "#e0614a"
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });
}
// ===============================
// 9. BUDGET SNAPSHOT (READ ONLY)
// ===============================
function renderBudgetSnapshot() {
  const container = document.querySelector(".budget-preview");
  if (!container) return;

  const monthBudgets = budgets.filter(b => b.month === selectedMonth);

  if (monthBudgets.length === 0) {
    container.innerHTML = "<p>No budgets set for this month.</p>";
    return;
  }

  const spending = getCategorySpending();

  let html = "";

  monthBudgets.forEach(b => {
    const spent = spending[b.category] || 0;
    const percent = Math.min((spent / b.limit) * 100, 100).toFixed(0);
    const color = spent > b.limit ? "#c0392b" : spent / b.limit > 0.8 ? "#e09a2a" : "#1a7a3a";

    html += `
      <div style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;font-size:13px">
          <span>${b.category}</span>
          <span>R${spent} / R${b.limit}</span>
        </div>
        <div style="background:#eee;border-radius:4px;height:6px;margin-top:4px">
          <div style="width:${percent}%;background:${color};height:6px;border-radius:4px"></div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}
// ===============================
// 10. Goals 
// ===============================
function renderGoalsSnapshot() {
  const container = document.querySelector(".goals-preview");
  if (!container) return;

  if (goals.length === 0) {
    container.innerHTML = "<p>No active goals yet.</p>";
    return;
  }

  const recent = goals.slice(0, 2);

  let html = "";

  recent.forEach(g => {
    const percent = Math.min((g.savedAmount / g.targetAmount) * 100, 100).toFixed(0);

    html += `
      <div style="border:1px solid var(--color-border-hr);border-radius:12px;padding:12px;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-weight:600;font-size:0.9rem">${g.name}</span>
          <span style="color:#1a7a3a;font-weight:600;font-size:0.85rem">${percent}%</span>
        </div>
        <div style="background:var(--color-border-hr);border-radius:4px;height:6px;margin-bottom:8px">
          <div style="width:${percent}%;background:#1a7a3a;height:6px;border-radius:4px"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--color-text-secondary)">
          <span>R${g.savedAmount} saved</span>
          <span>Goal: R${g.targetAmount}</span>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}
// ===============================
// 10. ANALYTICS (SUMMARY ONLY)
// ===============================
function renderAnalytics() {
  const box = document.querySelector(".analytics");
  if (!box) return;

  const filtered = getFilteredRaw();

  let income = 0;
  let expenses = 0;

  filtered.forEach(t => {
    if (t.type === "income") income += t.amount;
    if (t.type === "expense") expenses += t.amount;
  });

  const savings = income - expenses;

  box.innerHTML = `
    <h3>Dashboard Summary</h3>
    💰 Income: R${income} <br>
    📉 Expenses: R${expenses} <br>
    🏦 Savings: R${savings}
  `;
}


// ===============================
// 11. HELPERS
// ===============================
function getFilteredTransactions() {
  return transactions.filter(t => {
    if (selectedMonth === "AVERAGE") return true;
    return t.month === selectedMonth;
  });
}

function getFilteredRaw() {
  return getFilteredTransactions();
}

function getCategorySpending() {
  const spending = {};

  getFilteredRaw().forEach(t => {
    if (t.type === "expense") {
      spending[t.category] =
        (spending[t.category] || 0) + t.amount;
    }
  });

  return spending;
}

function getMonthKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function setText(selector, value) {
  const el = document.querySelector(selector);
  if (el) el.textContent = `R${value}`;
}


// ===============================
// 12. GLOBAL EXPORTS (ONLY WHAT DASHBOARD NEEDS)
// ===============================
window.setQuickMonth = setQuickMonth;