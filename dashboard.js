// 1. IMPORTS
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { auth } from "./firebase.js";

//call Firebase:
import {
  createUserIfNotExists,
  getUserData,
  saveTransactions as saveTransactionsToDB,
  saveBudgets as saveBudgetsToDB
} from "./firebaseDB.js";

// 2. GLOBAL STATE
let userId = null;
const defaults = {
    transactions: [],
    budgets: {}
};
let transactions = [];
let currentIndex = null;
// 2. UI STATE
let filterCategory = "All";
let filterType = "All";
let selectedMonth = "AVERAGE";

let sidebar;
let sidebarToggleBtn
let themeToggleBtn;
let themeIcon;
let searchForm;
let total;

let typeInput;
let incomeCategoryInput;
let expenseCategoryInput;

let nameInput;
let amountInput;
let display;
let submitBtn;
let budgets = {};
let categoryTotals;
let categoryButtons;
let analytics;
let dateInput;
let monthButtons;
let budgetOverview;
let monthPicker;
const profileBtn = document.getElementById("profileBtn");
const dropdown = document.getElementById("profileDropdown");





document.getElementById("logoutBtn")?.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
});
function setupUI() {

    sidebar = document.querySelector(".sidebar");
    sidebarToggleBtn = document.querySelectorAll(".sidebar-toggle");
    themeToggleBtn = document.querySelector(".theme-toggle");
    themeIcon = themeToggleBtn?.querySelector(".theme-icon");
    searchForm = document.querySelector(".search-form");


    typeInput = document.querySelector('.type-el');
    incomeCategoryInput = document.querySelector('.income-category-el');
    expenseCategoryInput = document.querySelector('.expense-category-el');

    nameInput = document.querySelector('.expName');
    amountInput = document.querySelector('.expAmount');
    display = document.querySelector('.expense-el');
    total = document.querySelector('.total-el');
    submitBtn = document.querySelector('.submit-btn');
    categoryTotals = document.querySelector('.category-totals');
    categoryButtons = document.querySelector('.category-buttons');
    analytics = document.querySelector(".analytics");
    dateInput = document.querySelector(".date-el");
    monthButtons = document.querySelector(".month-buttons");
    budgetOverview = document.querySelector(".budget-overview");
    
    monthPicker = document.querySelector(".month-picker");
    if(window.innerWidth >768){
        sidebar.classList.add("collapsed");
    }
    // EVENTS
    
    if (sidebarToggleBtn) {
        sidebarToggleBtn.forEach(btn => {
            btn.addEventListener("click", () => {
                sidebar.classList.toggle("collapsed");
                updateThemeIcon();
            });
        });
    }

    if (searchForm) {
        searchForm.addEventListener("click", () => {
            if (sidebar.classList.contains("collapsed")) {
                sidebar.classList.remove("collapsed");

                const input = searchForm.querySelector("input");
                if (input) input.focus();
            }
        });
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            const isDark = document.body.classList.toggle("dark-theme");
            localStorage.setItem("theme", isDark ? "dark" : "light");
            updateThemeIcon();
        });
    }
}


// 3. AUTH (GATEKEEP)
onAuthStateChanged(auth, async (user) => {
    //Check login
    if (!user) {
        window.location.replace("index.html");
        return;
    }

    //Save UID
    userId = user.uid;

    //CREATE USER IF FIRST TIME
    await createUserIfNotExists(user);

    //LOAD USER DATA FROM FIREBASE
    const data = await getUserData(userId);
    console.log("FIREBASE DATA LOADED:", data);
    const safeData = {
        ...defaults,
        ...data
    };
    //ASSIGN DATA INTO APP STATE
    transactions = safeData.transactions;
    budgets = safeData.budgets;

    const firstName = safeData.firstName || "User";

    const userNameEl = document.getElementById("userName");
    if (userNameEl) {
        userNameEl.textContent = firstName
            ? firstName.charAt(0).toUpperCase() + firstName.slice(1)
            : "User";
    }
    
    //START APP
    init();

    console.log("AUTH USER:", user);
    console.log("UID:", user?.uid);
});

function init() {
    loadTheme();
    setupUI();
    attachEvents();
    renderUI();
    setButtonMode();
}

profileBtn?.addEventListener("click", () => {
    dropdown.classList.toggle("hidden");
});
function loadTheme() {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    const shouldUseDarkTheme =
        savedTheme === "dark" || (!savedTheme && systemPrefersDark);

    document.body.classList.toggle("dark-theme", shouldUseDarkTheme);
    updateThemeIcon();
}

//updates theme icon based on current theme and sidebar state
const updateThemeIcon = () => {
    if (!themeIcon || !sidebar) return;

    const isDark = document.body.classList.contains("dark-theme");
    themeIcon.textContent =
        sidebar.classList.contains("collapsed")
            ? (isDark ? "light_mode" : "dark_mode")
            : "dark_mode";
};

function attachEvents() {
    if (typeInput) {
        typeInput.addEventListener("change", handleTypeChange);
    }

    const monthPickerEl = document.querySelector(".month-picker");

    if (monthPickerEl) {
        monthPickerEl.addEventListener("change", (e) => {
            selectedMonth = e.target.value;
            renderUI();
        });
    }
}


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
const categoryIcons = {
    Salary: "work",
    Allowance: "savings",
    Freelance: "laptop_chromebook",
    Business: "storefront",
    Investments: "trending_up",
    Dividends: "account_balance",

    Food: "restaurant",
    Transport: "directions_car",
    Rent: "home",
    Entertainment: "movie",
    Utilities: "bolt",
    Education: "school",
    Shopping: "shopping_cart",
    Health: "local_hospital",
    Savings: "savings"
};










function getCurrentMonthKey() {
    if (selectedMonth === "ALL") {
        return null;
    }
    return selectedMonth;
}
function setButtonMode(){
    if(currentIndex === null){
        submitBtn.textContent = "Add";
    } else {
        submitBtn.textContent = "Update";
    }
}

function addOrUpdateTransaction(){
    let name = nameInput.value.trim();
    let amount = Number(amountInput.value.trim());
    
    let type = typeInput.value;
    let category;

    let date = dateInput.value;
    if (!date) return;
    let d = new Date(date);
    let year = d.getFullYear();
    let month = d.getMonth() + 1;
    month = String(month).padStart(2, "0");
    let monthKey = `${year}-${month}`;

    if(type === "Income"){
        category = incomeCategoryInput.value;
    }else if(type === "Expense"){
        category = expenseCategoryInput.value;
    }

    if (!name || isNaN(amount) || amount <= 0 || type === '' || category === ''){
        return;
    }


    let transaction = {
        name,
        amount,
        type,
        category,
        date,
        month: monthKey
    };
    //Add
    if(currentIndex === null){
        transactions.push(transaction);
    }

    //Update
    else{
        transactions[currentIndex] = transaction;
        currentIndex = null; 
    }
    nameInput.value = '';
    amountInput.value = '';
    typeInput.value = '';

    incomeCategoryInput.value = '';
    expenseCategoryInput.value = '';

    saveTransactions();
    renderUI();
    setButtonMode();
}

function enterFunction(event){
    if(event.key === 'Enter'){
        addOrUpdateTransaction();
    }
}
function setTypeFilter(type){
    filterType = type;
    filterCategory = "All";
    renderUI();
}

function setCategoryFilter(category){
    filterCategory = category;
    renderUI();
}
function deleteTransactions(index){
    transactions.splice(index, 1);

    currentIndex = null;

    saveTransactions();
    renderUI();
    setButtonMode();
}


async function saveTransactions(){
    console.log("SAVING TRANSACTIONS:", transactions);
    await saveTransactionsToDB(userId, transactions);
}


async function saveBudgets(){
    await saveBudgetsToDB(userId, budgets);
}


function editTransactions(index){
    currentIndex = index;

    let transaction = transactions[index];

    typeInput.value = transactions[index].type;
    nameInput.value = transactions[index].name;
    amountInput.value = transactions[index].amount;

    handleTypeChange();

    if (transactions[index].type === "Income") {
        incomeCategoryInput.value = transactions[index].category;
    } else if (transactions[index].type === "Expense") {
        expenseCategoryInput.value = transactions[index].category;
    }

    renderUI();
    setButtonMode();
}

function renderUI(){
    display.innerHTML = '';
    renderTransactions();
    renderStatsCards();
    renderCategoryTotals();
    renderCategoryButtons();
    renderAnalytics();
    renderBudgetOverview();
    renderMonthButtons();
    renderRecentTransactions();
}
function renderTransactions(){
    display.innerHTML = '';

    let filtered = getFilteredTransactions();

    filtered.forEach(obj => {

        let t = obj.transaction;
        let index = obj.index;

        let isEditing = index === currentIndex;

            display.innerHTML += `
                <div style ="background: ${isEditing ? '#fff3cd' : 'transparent'}">
                    [${t.type}]: [${t.category}] ${t.name} - R${t.amount} 
                    <button onclick = "editTransactions(${index});">
                        Edit
                    </button>
                    <button onclick = "deleteTransactions(${index})">
                        Delete
                    </button>
                    <br>
                </div>
            `;
    });
}


// function renderTotal(){

//     let filtered = getFilteredRawTransactions();

//     let incomeTotal = 0;
//     let expenseTotal = 0;

//     filtered.forEach(t => {
//         if (t.type === "Income") {
//             incomeTotal += t.amount;
//         } else if (t.type === "Expense") {
//             expenseTotal += t.amount;
//         }
//     });

//     let balance = incomeTotal - expenseTotal;

//     total.innerHTML = `
//         Income: R${incomeTotal} <br>
//         Expenses: R${expenseTotal} <br>
//         Balance: R${balance}
//     `;
    
// }
function renderCategoryButtons(){
    categoryButtons.innerHTML = "";

    let categories = [];

    if (filterType === "Income") {
        categories = incomeCategories;
    } else if (filterType === "Expense") {
        categories = expenseCategories;
    } else {
        return; // hide when "All"
    }

    categories.forEach(cat => {
        categoryButtons.innerHTML  += `
            <button onclick="setCategoryFilter('${cat}')">
                ${cat}
            </button>
        `;
    });
}
function renderCategoryTotals(){
    let filtered = getFilteredRawTransactions();

    let incomeTotals = {};
    let expenseTotals = {};

    filtered.forEach(t => {

        if (t.type === "Income") {

            if (!incomeTotals[t.category]) {
                incomeTotals[t.category] = 0;
            }
            incomeTotals[t.category] += t.amount;

        } else if (t.type === "Expense") {

            if (!expenseTotals[t.category]) {
                expenseTotals[t.category] = 0;
            }
            expenseTotals[t.category] += t.amount;
        }
    });
    categoryTotals.innerHTML = "<h3>Income</h3>";

    for (let cat in incomeTotals) {
        categoryTotals.innerHTML += `${cat}: R${incomeTotals[cat]}<br>`;
    }

    categoryTotals.innerHTML += "<h3>Expenses</h3>";

    for (let cat in expenseTotals) {
        categoryTotals.innerHTML += `${cat}: R${expenseTotals[cat]}<br>`;
    }
}


function handleTypeChange() {
    let type = typeInput?.value;

    if (!incomeCategoryInput || !expenseCategoryInput) return;
    if(type === "Income"){
        incomeCategoryInput.hidden = false;
        expenseCategoryInput.hidden = true;
    }
    else if(type === "Expense"){
        incomeCategoryInput.hidden = true;
        expenseCategoryInput.hidden = false;
    }
    else {
        incomeCategoryInput.hidden = true;
        expenseCategoryInput.hidden = true;
    }
}

function renderAnalytics(){

    let filtered = getFilteredRawTransactions();

    let incomeTotal = 0;
    let expenseTotal = 0;

    // totals
    filtered.forEach(t => {
        if (t.type === "Income") {
            incomeTotal += t.amount;
        } else if (t.type === "Expense") {
            expenseTotal += t.amount;
        }
    });

    let savings = incomeTotal - expenseTotal;

    let totalSpent = expenseTotal; // ✅ FIXED POSITION

    // group expenses by category
    let expenseTotals = {};

    filtered.forEach(t => {
        if (t.type === "Expense") {

            if (!expenseTotals[t.category]) {
                expenseTotals[t.category] = 0;
            }

            expenseTotals[t.category] += t.amount;
        }
    });

    // find biggest category
    let topCategory = "";
    let topAmount = 0;

    for (let category in expenseTotals) {
        if (expenseTotals[category] > topAmount) {
            topAmount = expenseTotals[category];
            topCategory = category;
        }
    }

    // empty state
    if (filtered.length === 0) {
        analytics.innerHTML = `
            <h3>Dashboard Analytics</h3>
            💰 Savings: R0 <br>
            🔥 Top Category: None <br>
            📊 Top Spending: R0 <br>
            📉 Total Spent: R0
        `;
        return;
    }

    // display
    analytics.innerHTML = `
        <h3>Dashboard Analytics</h3>

        💰 Savings: R${savings} <br>
        🔥 Top Category: ${topCategory} <br>
        📊 Top Spending: R${topAmount} <br>
        📉 Total Spent: R${totalSpent}
    `;
}


function renderMonthButtons() {

    let availableMonths = new Set();

    transactions.forEach(t => {
        availableMonths.add(t.month);
    });

    monthButtons.innerHTML = "";

    // Average button
    monthButtons.innerHTML += `
        <button onclick="setMonth('AVERAGE')">AVERAGE</button>
    `;

    // buttons for each month
    availableMonths.forEach(month => {
        monthButtons.innerHTML += `
            <button onclick="setMonth('${month}')">
                ${month}
            </button>
        `;
    });
}
function setMonth(month) {
    selectedMonth = month;
    ensureMonthBudgets(month);
    renderUI();
}

function getFilteredTransactions() {
    return transactions
        .map((t, index) => ({
            transaction: t,
            index: index
       }))

        .filter(obj => {
            let t = obj.transaction;

            // month filter
            if (
                selectedMonth !== "AVERAGE" &&
                (!t.month || t.month !== selectedMonth)
            ) {
                return false;
            }
            
            // type filter
            if (filterType !== "All" && t.type !== filterType) {
                return false;
            }

            // category filter
            if (filterCategory !== "All" && t.category !== filterCategory) {
                return false;
            }

            return true;
    });
}
function getFilteredRawTransactions() {
    return getFilteredTransactions().map(obj => obj.transaction);
}

function getCategorySpending() {

    let categorySpending = {};
    let filtered = getFilteredRawTransactions();

    filtered.forEach(t => {

        if (t.type === "Expense") {

            if (!categorySpending[t.category]) {
                categorySpending[t.category] = 0;
            }

            categorySpending[t.category] += t.amount;
        }
    });

    return categorySpending;
}
function renderBudgetOverview() {

    let spending = getCategorySpending();

    let isAverageMode = selectedMonth === "AVERAGE";

    let monthBudgets;
    

    budgetOverview.innerHTML = `
    <h3>
        Budget Overview ${
            isAverageMode ? "(AVERAGE)" : `(${selectedMonth})`
        }
    </h3>
`;
    if (isAverageMode) {

    let months = Object.keys(budgets);

    monthBudgets = {};

    expenseCategories.forEach(cat => {
        let total = 0;
        let count = 0;

        months.forEach(m => {
            if (budgets[m] && budgets[m][cat]) {
                total += budgets[m][cat];
                count++;
            }
        });

        monthBudgets[cat] = count === 0 ? 0 : total / count;
    });

} else {
    ensureMonthBudgets(selectedMonth);
    monthBudgets = budgets[selectedMonth] || {};
}
    expenseCategories.forEach(category => {

        let budget = monthBudgets[category] || 0;
        let spent = spending[category] || 0;
        let remaining = budget - spent;

        let status = "";

        if (budget === 0) {
            status = "⚪ No budget set";
        } else if (remaining < 0) {
            status = "❌ OVERSPENT";
        } else if (remaining < budget * 0.2) {
            status = "⚠️ LOW";
        } else {
            status = "✅ OK";
        }

        budgetOverview.innerHTML += `
            <div style="border:1px solid #ddd; padding:10px; margin:8px 0;">
                
                <strong>${category}</strong><br>

                Budget:
                <input
                    type="number"
                    id="budget-${category}"
                    value="${budget}"
                    ${isAverageMode ? "disabled" : ""}
                />

                <button onclick="saveSingleBudget('${category}')">💾 Save</button>
                <button onclick="resetBudget('${category}')">🔄 Set to 0</button>

                <br><br>

                Spent: R${spent} <br>
                Remaining: R${remaining} <br>
                ${status}

            </div>
        `;
    });
}
function saveSingleBudget(category) {

    let month = selectedMonth;
    if (month === "AVERAGE") return;

    let input = document.getElementById(`budget-${category}`);
    let value = Number(input.value);

    if (isNaN(value) || value < 0) return;

    if (!budgets[month]) {
        budgets[month] = {};
    }

    budgets[month][category] = value;

    saveBudgets();
    renderUI();
}
function resetBudget(category) {

    let month = selectedMonth;
    if (month === "AVERAGE") return;

    if (!budgets[month]) {
        budgets[month] = {};
    }

    budgets[month][category] = 0;

    saveBudgets();
    renderUI();
}
function ensureMonthBudgets(month) {

    // already exists → do nothing
    if (budgets[month]) return;

    let months = Object.keys(budgets).sort();

    // find last month BEFORE current month
    let lastMonth = null;

    for (let i = months.length - 1; i >= 0; i--) {
        if (months[i] < month) {
            lastMonth = months[i];
            break;
        }
    }

    // if no previous data → create empty
    if (!lastMonth) {
        budgets[month] = {};
        return;
    }

    // COPY previous month
    if (typeof structuredClone === "function") {
        budgets[month] = structuredClone(budgets[lastMonth]);
    } else {
        budgets[month] = JSON.parse(JSON.stringify(budgets[lastMonth]));
    }
}
function getActiveMonth() {
    return selectedMonth;
}



function renderStatsCards() {
    let filtered = getFilteredRawTransactions();

    let income = 0;
    let expenses = 0;

    filtered.forEach(t => {
        if (t.type === "Income") {
            income += t.amount;
        } else if (t.type === "Expense") {
            expenses += t.amount;
        }
    });

    let savings = income - expenses;
    let balance = savings;

    document.querySelector(".income-value").textContent = `R${income}`;
    document.querySelector(".expense-value").textContent = `R${expenses}`;
    document.querySelector(".savings-value").textContent = `R${savings}`;
    document.querySelector(".balance-value").textContent = `R${balance}`;
}
function setQuickMonth(type) {
    let now = new Date();

    document.querySelectorAll(".quick-month-buttons button")
        .forEach(b => b.classList.remove("active"));

    if (type === "THIS") {
        selectedMonth = getMonthKey(now);
        document.querySelector("[onclick=\"setQuickMonth('THIS')\"]").classList.add("active");
    }

    if (type === "LAST") {
        let last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        selectedMonth = getMonthKey(last);
        document.querySelector("[onclick=\"setQuickMonth('LAST')\"]").classList.add("active");
    }

    renderUI();
}
function getMonthKey(date) {
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
}

//table

function renderRecentTransactions(){
    let recentBody = document.querySelector(".recent-transactions-body");

    // ALWAYS use selected month data
    let source = getFilteredRawTransactions();

    let sorted = [...source].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });

    let recent = sorted.slice(0, 3);

    recentBody.innerHTML = "";

    if (recent.length === 0) {
        recentBody.innerHTML = `
            <tr>
                <td colspan="4">No transactions for this month</td>
            </tr>
        `;
        return;
    }

    recent.forEach(t => {
        recentBody.innerHTML += `
            <tr>
                <td>${t.date}</td>
                <td>R${t.amount}</td>
                <td>${t.name}</td>
                <td>
                    <span class="material-symbols-rounded category-icon">
                        ${getCategoryIcon(t.category)}
                    </span>
                    ${t.category}
                </td>
            </tr>
        `;
    });
}

function getCategoryIcon(category) {
    return categoryIcons[category] || "category";
}

window.setMonth = setMonth;
window.editTransactions = editTransactions;
window.deleteTransactions = deleteTransactions;
window.saveSingleBudget = saveSingleBudget;
window.resetBudget = resetBudget;
window.setQuickMonth = setQuickMonth;

window.addOrUpdateTransaction = addOrUpdateTransaction;
window.enterFunction = enterFunction;
window.setTypeFilter = setTypeFilter;