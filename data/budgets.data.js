import {
    collection,
    addDoc,
    deleteDoc,
    doc, 
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

import { db } from "../firebase.js";

export async function addBudget(userId, budget){
    await addDoc(collection(db, "users", userId, "budgets"), budget);
}

export async function deleteBudget(userId, budgetId) {
    await deleteDoc(doc(db, "users", userId, "budgets", budgetId));
}
export async function updateBudget(userId, budgetId, budget) {
    await updateDoc(doc(db, "users", userId, "budgets", budgetId), budget);
}