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
    addGoal,
    deleteGoal, 
    updateGoal
} from "../data/goals.data.js";

import {
    renderGoals
}
from "../ui/goals.ui.js";

initSidebar();
initTheme();

let userId = null;
let goals = [];
let editingGoalId = null;

const listEl = document.getElementById("goalsList");
const nameEl = document.getElementById("goalName");
const targetAmountEl = document.getElementById("goalTargetAmount");
const savedAmountEl = document.getElementById("goalSavedAmount");
const targetDateEl = document.getElementById("goalTargetDate");
const form = document.getElementById("goalForm");
const formContainer = document.getElementById("goalFormContainer");
const openFormBtn = document.getElementById("openGoalsFormBtn");
const cancelFormBtn = document.getElementById("cancelGoalFormBtn");
const resetFiltersBtn = document.getElementById("resetFiltersBtn");

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "../index.html";
        return;
    }

    userId = user.uid;
    attachEvents();

    onSnapshot(collection(db, "users", userId, "goals"), (snapshot) => {
        goals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        render();
    });
});
function render() {
    renderGoals(listEl, getFilteredGoals());
}
function getFilteredGoals() {
    return goals;
}
function attachEvents() {
    openFormBtn.addEventListener("click", () => {
        formContainer.classList.remove("hidden");
    });

    cancelFormBtn.addEventListener("click", () => {
        formContainer.classList.add("hidden");
        form.reset();
    });
} 
window.addGoal = async function () {
    if (!userId) { alert("User not loaded yet."); return; }

    if (!nameEl.value || !targetAmountEl.value || !targetDateEl.value) {
        alert("Please fill in all fields.");
        return;
    }

    const gx = {
        name: nameEl.value,
        targetAmount: Number(targetAmountEl.value),
        savedAmount: Number(savedAmountEl.value),
        targetDate: targetDateEl.value
    };

    if (editingGoalId) {
        await updateGoal(userId, editingGoalId, gx);
        editingGoalId = null;
    } else {
        await addGoal(userId, gx);
    }
    form.reset();
    formContainer.classList.add("hidden");
}
window.deleteGoal = async function (id) {
    await deleteGoal(userId, id);
};
window.editGoal = function(id) {

    const gx =
        goals.find(g => g.id === id);

    if (!gx) return;

    editingGoalId = id;

    nameEl.value = gx.name;
    targetAmountEl.value = gx.targetAmount;
    targetDateEl.value = gx.targetDate;
    savedAmountEl.value = gx.savedAmount;

    formContainer.classList.remove("hidden");

    document.getElementById("formTitle")
        .textContent = "Edit Goal";
};