// ===============================
// 1. IMPORTS
// ===============================
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { auth } from "../firebase.js";
import { db } from "../firebase.js";
import {
    collection,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

import { initSidebar } from "../components/sidebar.js";
import { initTheme } from "../components/theme.js";

initSidebar();
initTheme();
// ===============================
// 2. STATE 
// ===============================
let userId = null;

let transactions = [];
let selectedMonth = new Date().toISOString().slice(0, 7);
// ===============================
// 3. AUTH + DATA LOAD
// ===============================
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.replace("../index.html");
        return;
    }

    userId = user.uid;
    attachEvents();
    const txRef = collection(db, "users", userId, "transactions");

    onSnapshot(txRef, (snapshot) => {

        transactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
        }));

        renderUI();              
    });
});
// ===============================
// 4. EVENTS 
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

function renderUI() {
    renderStatsCards();
    renderCategoryBreakdown();
    renderAnalyticsChart();
}

function getFilteredTransactions() {
    return transactions.filter(t => {
        if (selectedMonth === "ALL") return true;
        return t.month === selectedMonth;
    });
}

function setQuickMonth(type) {
    const now = new Date();
    if (type === "THIS") selectedMonth = getMonthKey(now);
    if (type === "LAST") {
        const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        selectedMonth = getMonthKey(last);
    }
    const monthPicker = document.querySelector(".month-picker");
    if (monthPicker) monthPicker.value = selectedMonth;
    renderUI();
}

function getMonthKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
}

function renderStatsCards(){
    const filtered = getFilteredTransactions();
    let totalExpenses = 0;

    const expenses = filtered.filter(t => t.type === "expense");
    const largest = expenses.reduce((max, t) => t.amount > max.amount ? t : max, { amount: 0, description: "—" });

    filtered.forEach(t => {
        if (t.type === "expense") totalExpenses+=t.amount;
    });

    const categoryTotals = {};
    expenses.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });
    const topCategory = Object.keys(categoryTotals).reduce((max, cat) => categoryTotals[cat] > (categoryTotals[max] || 0) ? cat : max, "—");

    const daysInMonth = new Date(selectedMonth.slice(0,4), selectedMonth.slice(5,7), 0).getDate();
    const avgDaily = (totalExpenses / daysInMonth).toFixed(2);

    setText(".total-spent-value", `R${totalExpenses}`);
    setText(".largest-expense-value", `R${largest.amount}`);
    setText(".largest-expense-name", largest.description);
    setText(".top-category-value", topCategory);
    setText(".avg-daily-value", `R${avgDaily}`);
}
// ===============================
// 5. HELPERS
// ===============================
function setText(selector, value) {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
}

function renderCategoryBreakdown() {
    const container = document.getElementById("analyticsCategories");
    if (!container) return;

    const expenses = getFilteredTransactions().filter(t => t.type === "expense");
    const categoryTotals = {};
    expenses.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const totalExpenses = Object.values(categoryTotals).reduce((sum, v) => sum + v, 0);

    if (Object.keys(categoryTotals).length === 0) {
        container.innerHTML = "<p>No expenses this period.</p>";
        return;
    }

    let html = "";
    Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).forEach(([cat, amount]) => {
        const percent = ((amount / totalExpenses) * 100).toFixed(0);
        html += `
            <div style="margin-bottom:12px">
                <div style="display:flex;justify-content:space-between;font-size:13px">
                    <span>${cat}</span>
                    <span>R${amount} (${percent}%)</span>
                </div>
                <div style="background:#eee;border-radius:4px;height:6px;margin-top:4px">
                    <div style="width:${percent}%;background:#1a7a3a;height:6px;border-radius:4px"></div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// ===============================
// 7. CHART
// ===============================
function renderAnalyticsChart() {
  const ctx = document.getElementById("analyticsChart");
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

  if (window.analyticsChart) {
    if (window.analyticsChart instanceof Chart) {
        window.analyticsChart.destroy();
    }
  }

  window.analyticsChart = new Chart(ctx, {
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
        legend: { position: "top" }
      }
    }
  });
}