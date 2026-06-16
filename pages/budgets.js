import { onAuthStateChanged }
from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import {
    collection,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

import { db } from "../firebase.js";
import { auth } from "../firebase.js";

import { initSidebar } from "../components/sidebar.js";
import { initTheme } from "../components/theme.js";

import {
    addBudget,
    deleteBudget, 
    updateBudget
} from "../data/budgets.data.js";

import {
    renderBudgets
}
from "../ui/budgets.ui.js";

initSidebar();
initTheme();

let userId = null;
let budgets = [];
let transactions = [];
let editingBudgetId = null;
let currentMonthFilter = "";

const monthFilter = document.getElementById("monthFilter");

const listEl = document.getElementById("budgetsList");
const categoryEl = document.getElementById("budgetCategory");
const limitEl = document.getElementById("budgetLimit");
const monthEl = document.getElementById("budgetMonth");
const form = document.getElementById("budgetForm");
const formContainer = document.getElementById("budgetFormContainer");
const openFormBtn = document.getElementById("openBudgetsFormBtn");
const cancelFormBtn = document.getElementById("cancelBudgetFormBtn");


onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "../index.html";
        return;
    }

    userId = user.uid;
    attachEvents();

    onSnapshot(collection(db, "users", userId, "budgets"), (snapshot) => {
        budgets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        render();
    });
    const txRef = collection(db, "users", userId, "transactions");
    onSnapshot(txRef, (snapshot) => {
        transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        render();
    });
});

function render() {
    renderBudgets(listEl, getFilteredBudgets(), getCategorySpending());
}
function getFilteredBudgets() {
    return budgets.filter(b => {
        if (currentMonthFilter && b.month !== currentMonthFilter) return false;
        return true;
    });
}
function attachEvents() {
    if (monthFilter) {
        monthFilter.addEventListener("change", () => {
            currentMonthFilter = monthFilter.value;
            render();
        });
    }
    openFormBtn.addEventListener("click", () => {
        formContainer.classList.remove("hidden");
    });

    cancelFormBtn.addEventListener("click", () => {
        formContainer.classList.add("hidden");
        form.reset();
    });
} 

window.addBudget = async function () {
    if (!userId) { alert("User not loaded yet."); return; }

    if (!categoryEl.value || !limitEl.value || !monthEl.value) {
        alert("Please fill in all fields.");
        return;
    }

    const bx = {
        category: categoryEl.value,
        limit: Number(limitEl.value),
        month: monthEl.value.slice(0, 7)
    };

    if (editingBudgetId) {
        await updateBudget(userId, editingBudgetId, bx);
        editingBudgetId = null;
    } else {
        await addBudget(userId, bx);
    }
    form.reset();
    formContainer.classList.add("hidden");
}
window.deleteBudget = async function (id) {
    await deleteBudget(userId, id);
};

window.editBudget = function(id) {

    const bx =
        budgets.find(b => b.id === id);

    if (!bx) return;

    editingBudgetId = id;

    categoryEl.value = bx.category;
    limitEl.value = bx.limit;
    monthEl.value = bx.month;

    formContainer.classList.remove("hidden");

    document.getElementById("formTitle")
        .textContent = "Edit Budget";
};

function getCategorySpending() {
    const spending = {};
    transactions.forEach(t => {
        if (t.type === "expense") {
            spending[t.category] = (spending[t.category] || 0) + t.amount;
        }
    });
    return spending;
}