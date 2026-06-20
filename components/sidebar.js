import { signOut } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { auth } from "../firebase.js";

let sidebar;
let sidebarToggleBtn;
let searchForm;

export function initSidebar() {
    sidebar = document.querySelector(".sidebar");
    sidebarToggleBtn = document.querySelectorAll(".sidebar-toggle");
    searchForm = document.querySelector(".search-form");

    if (!sidebar) return;

    if (window.innerWidth > 768) {
        sidebar.classList.add("collapsed");
    }

    if (sidebarToggleBtn) {
        sidebarToggleBtn.forEach(btn => {
            btn.addEventListener("click", () => {
                sidebar.classList.toggle("collapsed");
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

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            await signOut(auth);
            window.location.replace("../index.html");
        });
    }
}