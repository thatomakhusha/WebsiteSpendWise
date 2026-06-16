import { 
    onAuthStateChanged, 
    updatePassword, 
    reauthenticateWithCredential,
    EmailAuthProvider,
    deleteUser 
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import { 
    doc, 
    getDoc, 
    updateDoc,
    collection,
    getDocs,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

import { auth } from "../firebase.js";
import { db } from "../firebase.js";
import { initSidebar } from "../components/sidebar.js";
import { initTheme } from "../components/theme.js";

initSidebar();
initTheme();

let userId = null;
let currentUser = null;

const firstNameEl = document.getElementById("firstName");
const lastNameEl = document.getElementById("lastName");
const emailEl = document.getElementById("email");
const currentPasswordEl = document.getElementById("currentPassword");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const savePasswordBtn = document.getElementById("savePasswordBtn");
const newPasswordEl = document.getElementById("newPassword");
const confirmPasswordEl = document.getElementById("confirmPassword");
const deleteAccountBtn = document.getElementById("deleteAccountBtn");

function showToast(message, type = "success") {
    const existing = document.querySelector(".toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.replace("../index.html");
        return;
    }

    userId = user.uid;
    currentUser = user;
    emailEl.value = user.email;

    const snap = await getDoc(doc(db, "users", userId));
    if (snap.exists()) {
        const data = snap.data();
        firstNameEl.value = data.firstName || "";
        lastNameEl.value = data.lastName || "";
    }

    saveProfileBtn.addEventListener("click", async () => {
        if (!firstNameEl.value.trim()) {
            showToast("Please enter your first name.", "error");
            return;
        }
        await updateDoc(doc(db, "users", userId), {
            firstName: firstNameEl.value.trim(),
            lastName: lastNameEl.value.trim()
        });
        showToast("Profile saved successfully.");
    });

    savePasswordBtn.addEventListener("click", async () => {
        if (!newPasswordEl.value) {
            showToast("Please enter a new password.", "error");
            return;
        }
        if (newPasswordEl.value !== confirmPasswordEl.value) {
            showToast("Passwords do not match.", "error");
            return;
        }
        if (newPasswordEl.value.length < 6) {
            showToast("Password must be at least 6 characters.", "error");
            return;
        }

        const currentPassword = currentPasswordEl.value;
        if (!currentPassword) {
            showToast("Please enter your current password.", "error");
            return;
        }

        try {
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPasswordEl.value);
            showToast("Password updated successfully.");
            newPasswordEl.value = "";
            confirmPasswordEl.value = "";
            currentPasswordEl.value = "";
        } catch (err) {
            if (err.code === "auth/wrong-password") {
                showToast("Current password is incorrect.", "error");
            } else {
                showToast("Error updating password. Please try again.", "error");
            }
        }
    });

    deleteAccountBtn.addEventListener("click", async () => {
        const confirmed = window.confirm("Are you sure? This will permanently delete your account and ALL your data.");
        if (!confirmed) return;

        const currentPassword = currentPasswordEl.value;
        if (!currentPassword) {
            showToast("Please enter your current password to confirm deletion.", "error");
            return;
        }

        try {
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);

            await deleteSubcollection(userId, "transactions");
            await deleteSubcollection(userId, "budgets");
            await deleteSubcollection(userId, "goals");
            await deleteDoc(doc(db, "users", userId));
            await deleteUser(user);

            window.location.replace("index.html");
        } catch (err) {
            if (err.code === "auth/wrong-password") {
                showToast("Incorrect password.", "error");
            } else {
                showToast("Error deleting account. Please try again.", "error");
            }
        }
    });
});

async function deleteSubcollection(userId, subcollection) {
    const ref = collection(db, "users", userId, subcollection);
    const snap = await getDocs(ref);
    const deletes = snap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletes);
}