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
    addTransaction,
    deleteTransaction, 
    updateTransaction
} from "../data/transaction.data.js";

import {
    renderTransactions
}
from "../ui/transactions.ui.js";

initSidebar();
initTheme();

let userId = null;
let transactions = [];
let editingId = null;

let currentTypeFilter = "all";
let currentCategoryFilter = "all";
let currentMonthFilter = "";

const listEl = document.getElementById("transactionsList");

const form = document.getElementById("transactionForm");

const formContainer =document.getElementById("transactionFormContainer");
const openFormBtn = document.getElementById("openTransactionFormBtn");
const cancelFormBtn = document.getElementById("cancelFormBtn");

const typeEl = document.getElementById("transactionType");
const categoryEl = document.getElementById("category");
const amountEl = document.getElementById("amount");
const descriptionEl = document.getElementById("description");
const dateEl = document.getElementById("date");

const typeFilter = document.getElementById("typeFilter");
const categoryFilter = document.getElementById("categoryFilter");
const monthFilter = document.getElementById("monthFilter");
const resetFiltersBtn = document.getElementById("resetFiltersBtn");

const incomeCategories = [
    "Salary",
    "Allowance",
    "Freelance",
    "Business",
    "Investments",
    "Dividends"
];

const expenseCategories = [
    "Food",
    "Transport",
    "Rent",
    "Entertainment",
    "Utilities",
    "Education",
    "Shopping",
    "Health",
    "Savings"
];

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "../index.html";
        return;
    }

    userId = user.uid;

    populateCategories();
    populateFilterCategories();
    attachEvents();

    onSnapshot(collection(db, "users", userId, "transactions"), (snapshot) => {
        transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        render();
    });
});
function attachEvents() {

    typeEl.addEventListener("change", populateCategories);

    openFormBtn.addEventListener("click", () => {
        populateCategories();
        formContainer.classList.remove("hidden");
    });

    cancelFormBtn.addEventListener("click", () => {
        formContainer.classList.add("hidden");
        form.reset();
    });

    window.setTypeFilter = function(type) {
        currentTypeFilter = type;
        document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        document.getElementById('filter' + type.charAt(0).toUpperCase() + type.slice(1)).classList.add('active');
        render();
    }

    categoryFilter.addEventListener("change", () => {
        currentCategoryFilter = categoryFilter.value;
        render();
    });

    monthFilter.addEventListener("change", () => {
        currentMonthFilter = monthFilter.value;
        render();
    });

    resetFiltersBtn.addEventListener("click", () => {

        currentTypeFilter = "all";
        currentCategoryFilter = "all";
        currentMonthFilter = "";

        typeFilter.value = "all";
        categoryFilter.value = "all";
        monthFilter.value = "";

        render();
    });
}


function populateCategories() {
    categoryEl.innerHTML = "";

    const categories =
        typeEl.value === "income"
            ? incomeCategories
            : expenseCategories;

    categories.forEach(category => {
        const option = document.createElement("option");

        option.value = category;
        option.textContent = category;

        categoryEl.appendChild(option);
    });
}

function populateFilterCategories() {

    categoryFilter.innerHTML =
        '<option value="all">All Categories</option>';

    [...incomeCategories, ...expenseCategories]
        .forEach(category => {

            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;

            categoryFilter.appendChild(option);
        });
}

function render() {
    renderTransactions(listEl, getFilteredTransactions());
}

function getFilteredTransactions() {
    return transactions.filter(tx => {

        if (
            currentTypeFilter !== "all" &&
            tx.type !== currentTypeFilter
        ) return false;

        if (
            currentCategoryFilter !== "all" &&
            tx.category !== currentCategoryFilter
        ) return false;

        if (
            currentMonthFilter &&
            !tx.date.startsWith(currentMonthFilter)
        ) return false;

        return true;
    });
}


window.addTransaction = async function () {
    if (!userId) { alert("User not loaded yet."); return; }

    if (!typeEl.value || !categoryEl.value || !amountEl.value || !descriptionEl.value || !dateEl.value) {
        alert("Please fill in all fields.");
        return;
    }

    const tx = {
        type: typeEl.value,
        category: categoryEl.value,
        amount: Number(amountEl.value),
        description: descriptionEl.value.trim(),
        date: dateEl.value,
        month: dateEl.value.slice(0, 7)
    };

    if (editingId) {
        await updateTransaction(userId, editingId, tx);
        editingId = null;
    } else {
        await addTransaction(userId, tx);
    }

    form.reset();
    formContainer.classList.add("hidden");
};

window.deleteTransaction = async function (id) {
    await deleteTransaction(userId, id);
};

//EDIT TRANSACTION


window.editTransaction = function(id) {

    const tx =
        transactions.find(t => t.id === id);

    if (!tx) return;

    editingId = id;

    typeEl.value = tx.type;

    populateCategories();

    categoryEl.value = tx.category;
    amountEl.value = tx.amount;
    descriptionEl.value = tx.description;
    dateEl.value = tx.date;

    formContainer.classList.remove("hidden");

    document.getElementById("formTitle")
        .textContent = "Edit Transaction";
};