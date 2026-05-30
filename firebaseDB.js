import {
  doc, //points to a document (like users/{uid})
  getDoc, //read data
  setDoc, //create/overwrite data
  updateDoc //update only part of data
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

import { db } from "./firebase.js"; //db is the first database instance

//check if user exists & this runs when user logs in.
export async function createUserIfNotExists(user, firstNameFromForm = null) {
    //We first reference the user document:
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        await setDoc(userRef, {
            firstName: user.displayName || "",
            email: user.email || "",
            transactions: [],
            budgets: {},
            createdAt: new Date().toISOString()
        });
    }
}

//Get user data (this replaces: localStorage.getItem("transactions"))
export async function getUserData(uid) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    return snap.data();
  } else {
    return null;
  }
}

//Save transactions (this replaces: localStorage.setItem(...))
export async function saveTransactions(uid, transactions) {
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    transactions: transactions
  });
}

//save budgets
export async function saveBudgets(uid, budgets) {
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    budgets: budgets
  });
}
