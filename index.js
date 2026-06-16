import { auth } from "./firebase.js";
import { createUserIfNotExists } from "./userService.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
    const path = window.location.pathname;

    if (path.includes("/pages/") && !user) {
        window.location.replace("../index.html");
    }
});

if (!auth) {
    console.error("Firebase auth not initialized");
}
const safe = (el) => el !== null;
const formOpenBtn = document.querySelector("#form_open"),
    home = document.querySelector(".home"),
    formContainer =  document.querySelector(".form_container"),
    formCloseBtn = document.querySelector(".form_close"),
    signupBtn  = document.querySelector("#signup"),
    loginBtn  = document.querySelector("#login"),
    pwShowHide = document.querySelectorAll(".password_hidden"),
    main = document.querySelector(".main");

const loginSubmitBtn = document.querySelector("#loginSubmitBtn");
const signupSubmitBtn = document.querySelector("#signupSubmitBtn");
const footerLogin = document.querySelector("#footerLogin");
const getStartedSignUp = document.querySelectorAll(".getStarted");

const loginEmail = document.querySelector("#email");
const loginPassword = document.querySelector("#password");

const signupEmail = document.querySelector("#signupEmail");
const signupPassword = document.querySelector("#signupPassword");
const confirmPassword = document.querySelector("#confirmPassword");
const signupFormEl = document.getElementById("signupForm");
const loginFormEl = document.getElementById("loginForm");
const strengthFill = document.querySelector("#strengthFill");
const emailError = document.querySelector("#emailError");
const passwordError = document.querySelector("#passwordError");

const emailErrorSignup = document.querySelector("#emailErrorSignup");
const passwordErrorSignup = document.querySelector("#passwordErrorSignup");

const lengthCheck = document.querySelector("#length");
const upperCheck = document.querySelector("#upper");
const lowerCheck = document.querySelector("#lower");
const numberCheck = document.querySelector("#number");
const symbolCheck = document.querySelector("#symbol");
const confirmError = document.querySelector("#confirmError");

if (signupBtn) {
    signupBtn.addEventListener("click", (e) => {
        e.preventDefault();

        home.classList.add("show");
        main.classList.add("show");
        document.body.classList.add("modal-open");

        formContainer.classList.add("active"); // switch to signup
    });
}
if (loginBtn) {
    loginBtn.addEventListener("click", (e) => {
        e.preventDefault();

        formContainer.classList.remove("active"); // switch to login
    });
}
if (signupFormEl) {
signupFormEl.addEventListener("submit", async (e) => {
    if (!safe(signupEmail) || !safe(signupPassword)) return;
    e.preventDefault();

    const firstName = document.querySelector("#firstName").value;
    const lastName = document.querySelector("#signupLastName").value;

    const email = signupEmail.value;
    const password = signupPassword.value;

    console.log("First Name:", firstName); // DEBUG
    console.log("Last Name:", lastName);   // DEBUG

    if (!validateSignupEmail(email)) return;
    if (!validateSignupPassword(password)) return;

    if (password !== confirmPassword.value) {
        confirmError.textContent = "Passwords do not match";
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        await createUserIfNotExists(
            userCredential.user,
            firstName
        );

        window.location.href = "pages/dashboard.html";

    } catch (error) {
        alert(error.message);
    }
});
}
if (loginFormEl) {
loginFormEl.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = loginEmail.value;
    const password = loginPassword.value;
    if (!safe(loginEmail) || !safe(loginPassword)) return;
    e.preventDefault();

    

    if (!validateLoginEmail(email)) return;
    if (!validateLoginPassword(password)) return;

    try {
        loginSubmitBtn.disabled = true;
        loginSubmitBtn.textContent = "Logging in...";

        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "pages/dashboard.html";

    } catch (error) {
        loginSubmitBtn.textContent = "Login";
        loginSubmitBtn.disabled = false;
        loginSubmitBtn.blur();
        alert(error.message);
    }
});
}
// OPEN MODAL + BLUR
if (formOpenBtn) {
    formOpenBtn.addEventListener("click", () => {
        home.classList.add("show");
        main.classList.add("show");
        document.body.classList.add("modal-open");
    });
}
if (footerLogin) {
    footerLogin.addEventListener("click", (e) => {
        e.preventDefault();

        home.classList.add("show");
        main.classList.add("show");
        document.body.classList.add("modal-open");

        formContainer.classList.remove("active"); // ensure login mode
    });
}
if (getStartedSignUp.length > 0) {
    getStartedSignUp.forEach(btn => {
        btn.addEventListener("click", () => {

            home.classList.add("show");
            main.classList.add("show");
            document.body.classList.add("modal-open");

            formContainer.classList.add("active"); // signup mode
        });
    });
}
// CLOSE MODAL + REMOVE BLUR
function closeModal() {
    home.classList.remove("show");
    main.classList.remove("show");
    document.body.classList.remove("modal-open");

    formContainer.classList.remove("active"); // back to login
    resetAuthUI();
}

// CLOSE BUTTON
if (formCloseBtn) {
    formCloseBtn.addEventListener("click", closeModal);
}
// CLICK OUTSIDE MODAL
if (home) {
    home.addEventListener("click", (e) => {
        if (e.target === home) {
            closeModal();
        }
    });
}
if (pwShowHide) {
    pwShowHide?.forEach((icon) => {
        icon.addEventListener("click", () => {
            let getPwInput = icon.parentElement.querySelector("input");

            if (!getPwInput) return;
            if(getPwInput.type === "password"){
                getPwInput.type = "text";
                icon.classList.replace("uil-eye-slash", "uil-eye")
            }
            else {
                getPwInput.type = "password";
                icon.classList.replace("uil-eye", "uil-eye-slash");
            }
        })
    });
}
loginPassword?.addEventListener("input", updateValidationUI);
loginEmail?.addEventListener("input", updateValidationUI);
signupEmail?.addEventListener("input", updateValidationUI);
signupPassword?.addEventListener("input", updateValidationUI);
confirmPassword?.addEventListener("input", updateValidationUI);

function toggle(el, condition) {
    if (condition) {
        el.classList.add("valid");
    } else {
        el.classList.remove("valid");
    }
}
function isSignupMode() {
    return formContainer.classList.contains("active");
}


function validateLoginEmail(email) {
    return /\S+@\S+\.\S+/.test(email.trim());
}
function validateLoginPassword(password) {
    return (
        password.trim().length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[!@#$%^&*(),.?":{}|<>]/.test(password)
    );
}
function validateSignupEmail(email) {
    return /\S+@\S+\.\S+/.test(email.trim());
}
function validateSignupPassword(password) {
    return (
        password.trim().length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[!@#$%^&*(),.?":{}|<>]/.test(password)
    );
}

function getPasswordStrength(password) {

    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    return strength;
}

function updateStrength(password) {
    const strength = getPasswordStrength(password);
    const percent = (strength / 5) * 100;

    strengthFill.style.width = percent + "%";

    strengthFill.style.background =
        strength <= 2 ? "red" :
        strength <= 4 ? "orange" :
        "#23ca01";
}

function updateValidationUI() {
    const signupPw = signupPassword?.value || "";
    const confirmPw = confirmPassword?.value || "";

    const passwordsMatch = signupPw === confirmPw;

    if (signupPw && confirmPw) {
        if (passwordsMatch) {
            confirmError.textContent = "";
            confirmPassword.style.borderBottom = "2px solid #23ca01";
        } else {
            confirmError.textContent = "Passwords do not match";
            confirmError.style.color = "red";
            confirmPassword.style.borderBottom = "2px solid red";
        }
    }
    if (isSignupMode()) {

        const emailValid = validateSignupEmail(signupEmail.value);
        const passwordValid = validateSignupPassword(signupPassword.value);
        // PASSWORD CHECKLIST
        toggle(lengthCheck, signupPw.length >= 8);
        toggle(upperCheck, /[A-Z]/.test(signupPw));
        toggle(lowerCheck, /[a-z]/.test(signupPw));
        toggle(numberCheck, /[0-9]/.test(signupPw));
        toggle(symbolCheck, /[!@#$%^&*(),.?":{}|<>]/.test(signupPw));

        // STRENGTH BAR
        updateStrength(signupPw);
        // ERROR TEXT
        emailErrorSignup.textContent = emailValid
            ? ""
            : "Use valid email (e.g. @gmail, @outlook, @icloud)";

        

        // BUTTON STATE
        signupSubmitBtn.disabled = !(emailValid && passwordValid);

        

    } else {

        const emailValid = validateLoginEmail(loginEmail.value);
        const passwordValid = validateLoginPassword(loginPassword.value);

        loginSubmitBtn.disabled = !(emailValid && passwordValid);

        
    }
}

function resetAuthUI() {

    // reset forms
    document.querySelectorAll("form").forEach(f => f.reset());

    // reset checklist
    [lengthCheck, upperCheck, lowerCheck, numberCheck, symbolCheck]
        .forEach(el => el.classList.remove("valid"));

    // reset strength bar
    if (strengthFill) {
        strengthFill.style.width = "0%";
        strengthFill.style.background = "red";
    }
    // reset confirm password UI
    if (confirmError){
        confirmError.textContent = "";
    }
    if (confirmPassword){
        confirmPassword.style.borderBottom = "";
    }
    // reset errors
    emailErrorSignup.textContent = "";
    passwordErrorSignup.textContent = "";
    emailError.textContent = "";
    passwordError.textContent = "";

    signupSubmitBtn && (signupSubmitBtn.disabled = true);
    loginSubmitBtn.disabled = true;
}

updateValidationUI();