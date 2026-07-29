// ------------------------------
// FORM SWITCH
// ------------------------------

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const forgotForm = document.getElementById("forgotForm");

const tabs = document.querySelectorAll(".tab-btn");

function hideAllForms() {

    if(loginForm) loginForm.classList.remove("active");
    if(registerForm) registerForm.classList.remove("active");
    if(forgotForm) forgotForm.classList.remove("active");

}

function clearTabs() {

    tabs.forEach(tab => tab.classList.remove("active"));

}

function switchForm(type) {

    hideAllForms();

    if(type === "login"){

        loginForm.classList.add("active");

        clearTabs();

        tabs[0].classList.add("active");

    }

    else if(type === "register"){

        registerForm.classList.add("active");

        clearTabs();

        tabs[1].classList.add("active");

    }

    else{

        forgotForm.classList.add("active");

        clearTabs();

    }

}

// ------------------------------
// RESERVED ADMIN DETAILS
// ------------------------------

const ADMIN_USERNAME = "sriramsundar";
const ADMIN_PASSWORD = "ga@45";

// ------------------------------
// REGISTER USERNAME AVAILABILITY CHECK
// ------------------------------

let usernameAvailable = null; // null = unchecked, true = available, false = taken

function checkUsernameAvailability() {
    const usernameInput = document.querySelector("#registerForm input[name='username']");
    const username = usernameInput.value.trim();
    let msgEl = document.getElementById("username-availability-msg");
    if (!msgEl) {
        msgEl = document.createElement("div");
        msgEl.id = "username-availability-msg";
        msgEl.style.cssText = "margin-top: -12px; margin-bottom: 12px; font-size: 0.82rem; font-weight: 600; padding: 6px 10px; border-radius: 6px; transition: all 0.3s;";
        usernameInput.parentNode.insertAdjacentElement("afterend", msgEl);
    }

    if (!username) {
        msgEl.style.display = "none";
        usernameAvailable = null;
        return;
    }

    // Client-side admin check first
    if (username.toLowerCase() === ADMIN_USERNAME.toLowerCase()) {
        msgEl.style.display = "block";
        msgEl.style.background = "rgba(255,51,102,0.15)";
        msgEl.style.color = "#ff3366";
        msgEl.style.border = "1px solid rgba(255,51,102,0.4)";
        msgEl.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> This username is reserved. Please choose another.';
        usernameAvailable = false;
        return;
    }

    // Server-side check
    fetch(`/check_username?username=${encodeURIComponent(username)}`)
    .then(res => res.json())
    .then(data => {
        msgEl.style.display = "block";
        if (data.available) {
            msgEl.style.background = "rgba(0,255,136,0.1)";
            msgEl.style.color = "#00ff88";
            msgEl.style.border = "1px solid rgba(0,255,136,0.3)";
            msgEl.innerHTML = '<i class="fa-solid fa-circle-check"></i> ' + data.message;
            usernameAvailable = true;
        } else {
            msgEl.style.background = "rgba(255,51,102,0.15)";
            msgEl.style.color = "#ff3366";
            msgEl.style.border = "1px solid rgba(255,51,102,0.4)";
            msgEl.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> ' + data.message;
            usernameAvailable = false;
        }
    })
    .catch(() => { usernameAvailable = null; });
}

// Attach listener after DOM loads
window.addEventListener("DOMContentLoaded", () => {
    const usernameInput = document.querySelector("#registerForm input[name='username']");
    if (usernameInput) {
        usernameInput.addEventListener("blur", checkUsernameAvailability);
        usernameInput.addEventListener("input", () => {
            usernameAvailable = null;
            const msgEl = document.getElementById("username-availability-msg");
            if (msgEl) msgEl.style.display = "none";
        });
    }
});

// ------------------------------
// REGISTER VALIDATION
// ------------------------------

function validateRegister(){

    const username = document.querySelector(
        "#registerForm input[name='username']"
    ).value.trim().toLowerCase();

    const password =
    document.getElementById("reg_pass").value;

    if(username === ADMIN_USERNAME){

        showToast("Username Reserved For Admin", "error");

        return false;

    }

    if(password === ADMIN_PASSWORD){

        showToast("Password Reserved For Admin", "error");

        return false;

    }

    if(password.length < 6){

        showToast("Password must contain minimum 6 characters", "error");

        return false;

    }

    // Block if username is already taken
    if (usernameAvailable === false) {
        showToast("Please choose a different username before registering.", "error");
        return false;
    }

    return true;

}

// ------------------------------
// LOGIN VALIDATION
// ------------------------------

if(loginForm){

loginForm.addEventListener("submit",function(e){

    const username =
    document.querySelector(
    "#loginForm input[name='username']"
    ).value.trim().toLowerCase();

    const password =
    document.querySelector(
    "#loginForm input[name='password']"
    ).value;

    if(username === ADMIN_USERNAME){

        if(password !== ADMIN_PASSWORD){

            showToast("Invalid Admin Password", "error");

            e.preventDefault();

        }

    }

    else{

        if(password === ADMIN_PASSWORD){

            showToast("Invalid Username or Password", "error");

            e.preventDefault();

        }

    }

});

}

// ------------------------------
// WHATSAPP VALIDATION
// ------------------------------

const whatsappInput =
document.querySelector(
"#registerForm input[name='whatsapp']"
);

if(whatsappInput){

whatsappInput.addEventListener("input",function(){

    this.value = this.value.replace(/\D/g,'');

    if(this.value.length > 10){

        this.value = this.value.slice(0,10);

    }

});

}

// ------------------------------
// PASSWORD SHOW / HIDE
// ------------------------------

document.querySelectorAll("input[type=password]").forEach(input=>{

    input.addEventListener("dblclick",function(){

        if(this.type==="password"){

            this.type="text";

        }

        else{

            this.type="password";

        }

    });

});

// ------------------------------
// PAGE LOAD
// ------------------------------

window.onload=function(){

    switchForm("login");

};