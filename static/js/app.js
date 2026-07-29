//login page
function switchForm(formType) {
    // All forms and tabs-ah extract panrom
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotForm = document.getElementById('forgotForm');
    const tabs = document.querySelectorAll('.tab-btn');

    // Alert-la visual delay illama clean-ah clear panrom
    loginForm.classList.remove('active');
    registerForm.classList.remove('active');
    forgotForm.classList.remove('active');
    tabs[0].classList.remove('active');
    tabs[1].classList.remove('active');

    // Content trigger condition
    if (formType === 'login') {
        loginForm.classList.add('active');
        tabs[0].classList.add('active');
    } else if (formType === 'register') {
        registerForm.classList.add('active');
        tabs[1].classList.add('active');
    } else if (formType === 'forgot') {
        forgotForm.classList.add('active');
    }
}
// ------------------------------
// FORM SWITCH
// ------------------------------

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const forgotForm = document.getElementById("forgotForm");

const tabs = document.querySelectorAll(".tab-btn");

function hideAllForms() {

    loginForm.classList.remove("active");
    registerForm.classList.remove("active");
    forgotForm.classList.remove("active");

}

function clearTabs() {

    tabs.forEach(tab => tab.classList.remove("active"));

}

function switchForm(type) {

    hideAllForms();

    if(type==="login"){

        loginForm.classList.add("active");

        clearTabs();

        tabs[0].classList.add("active");

    }

    else if(type==="register"){

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
// REGISTER VALIDATION
// ------------------------------

function validateRegister(){

    const username = document.querySelector(
        "#registerForm input[name='username']"
    ).value.trim().toLowerCase();

    const password =
    document.getElementById("reg_pass").value;

    const confirm =
    document.getElementById("reg_confirm_pass").value;

    if(username===ADMIN_USERNAME){

        alert("Username Reserved For Admin");

        return false;

    }

    if(password===ADMIN_PASSWORD){

        alert("Password Reserved For Admin");

        return false;

    }

    if(password.length<6){

        alert("Password must contain minimum 6 characters");

        return false;

    }

    if(password!==confirm){

        alert("Passwords Do Not Match");

        return false;

    }

    return true;

}

// ------------------------------
// LOGIN VALIDATION
// ------------------------------

loginForm.addEventListener("submit",function(e){

    const username =
    document.querySelector(
    "#loginForm input[name='username']"
    ).value.trim().toLowerCase();

    const password =
    document.querySelector(
    "#loginForm input[name='password']"
    ).value;

    if(username===ADMIN_USERNAME){

        if(password!==ADMIN_PASSWORD){

            alert("Invalid Admin Password");

            e.preventDefault();

        }

    }

    else{

        if(password===ADMIN_PASSWORD){

            alert("Password Reserved For Admin");

            e.preventDefault();

        }

    }

});

// ------------------------------
// WHATSAPP NUMBER
// ------------------------------

const whatsappInput =
document.querySelector(
"#registerForm input[name='whatsapp']"
);

whatsappInput.addEventListener("input",function(){

    this.value=this.value.replace(/\D/g,'');

    if(this.value.length>10){

        this.value=this.value.slice(0,10);

    }

});

// ------------------------------
// PASSWORD SHOW/HIDE
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

//user profile page----------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------
// Menu Animation

const menu = document.querySelector(".menu");

menu.onclick = () => {

menu.classList.toggle("active");

}

// Card Click Animation

const cards = document.querySelectorAll(".card");

cards.forEach(card=>{

card.addEventListener("click",()=>{

card.animate([

{

transform:"scale(1)"

},

{

transform:"scale(.95)"

},

{

transform:"scale(1.03)"

},

{

transform:"scale(1)"

}

],{

duration:300

});

});

});
//logout confirmation-------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------
// Logout Button Click Event
// Logout Button Click Event
function logoutUser() {

    if (confirm("Are you sure you want to logout?")) {
        window.location.href = "/logout";
    }

}
function openProfile() {
    const modal = document.getElementById("profileModal");

    if (modal) {
        modal.style.display = "flex";
    }
}

function closeProfile() {
    const modal = document.getElementById("profileModal");

    if (modal) {
        modal.style.display = "none";
    }
}

window.addEventListener("click", function (event) {

    const modal = document.getElementById("profileModal");

    if (modal && event.target === modal) {

        closeProfile();

    }

});