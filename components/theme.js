let themeToggleBtn;
let themeIcon;

export function initTheme() {
    themeToggleBtn = document.querySelector(".theme-toggle");
    themeIcon = themeToggleBtn?.querySelector(".theme-icon");

    if (!themeToggleBtn) return;

    themeToggleBtn.addEventListener("click", () => {
        const isDark = document.body.classList.toggle("dark-theme");
        localStorage.setItem("theme", isDark ? "dark" : "light");

        updateThemeIcon();
    });

    loadTheme();
}

function loadTheme() {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    const shouldUseDark =
        savedTheme === "dark" || (!savedTheme && systemPrefersDark);

    document.body.classList.toggle("dark-theme", shouldUseDark);

    updateThemeIcon();
}

function updateThemeIcon() {
    if (!themeIcon) return;

    const isDark = document.body.classList.contains("dark-theme");

    themeIcon.textContent = isDark ? "light_mode" : "dark_mode";
}