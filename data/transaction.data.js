import {
    collection,
    addDoc,
    deleteDoc,
    doc, 
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

import { db } from "../firebase.js";

export async function addTransaction(userId, transaction) {
    await addDoc(collection(db, "users", userId, "transactions"), transaction);
}

export async function deleteTransaction(userId, transactionId) {
    await deleteDoc(doc(db, "users", userId, "transactions", transactionId));
}

export async function updateTransaction(userId, transactionId, transaction) {
    await updateDoc(doc(db, "users", userId, "transactions", transactionId), transaction);
}