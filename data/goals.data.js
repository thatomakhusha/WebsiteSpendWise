import {
    collection,
    addDoc,
    deleteDoc,
    doc, 
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

import { db } from "../firebase.js";

export async function addGoal(userId, goal){
    await addDoc(collection(db, "users", userId, "goals"), goal);
}

export async function deleteGoal(userId, goalId) {
    await deleteDoc(doc(db, "users", userId, "goals", goalId));
}
export async function updateGoal(userId, goalId, goal) {
    await updateDoc(doc(db, "users", userId, "goals", goalId), goal);
}