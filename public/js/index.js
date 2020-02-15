///////////////////////////////////////////////////////////////////////////////
// TAB SCROLL                                                              ///
/////////////////////////////////////////////////////////////////////////////
function tabScroll(e) {
    const th = this.offsetHeight;
    const bh = document.querySelector("body").offsetHeight;

    console.log(th, bh);

    let toff = Number(this.style.top.slice(0, -2));

    toff -= e.deltaY / Math.abs(e.deltaY) * 28;

    if (toff > 0) toff = 0; else if (toff < (bh - th)) toff = (bh - th);

    this.style.top = "" + toff + "px";
}

document.querySelectorAll(".tab").forEach((c) => {
    c.addEventListener("wheel", tabScroll);
});

///////////////////////////////////////////////////////////////////////////////
// FORMS                                                                   ///
/////////////////////////////////////////////////////////////////////////////
/********/
/* MISC */
/********/
function httpRequest(reqType, url, data, callback) {
    const http = new XMLHttpRequest();

    http.open(reqType, url, true);

    http.onreadystatechange = callback;

    http.send(data);
}

/************/
/* SETTINGS */
/************/
/* CONSTANTS */
const settingsUpdateForm = document.querySelector("#settings-form");
const settingsDeleteButtons = document.querySelectorAll(".settingsDelete");

/* FUNCTIONS */
function settingsUpdateDocument() {
    console.log(this.responseText);
}

function settingsDeleteDocument() {
    console.log(this.response);
}

/* HANDLERS */
async function settingsUpdate() {
    event.returnValue = false;

    const data = new FormData(this);

    httpRequest("POST", "/settings", data, settingsUpdateDocument);
}

async function settingsDelete() {
    event.returnValue = false;

    const data = new FormData();
    data.append("settingsDelete", this.value);

    httpRequest("DELETE", "/settings", data, settingsDeleteDocument);
}

/* EVENT LISTENERS */
settingsUpdateForm.addEventListener("submit", settingsUpdate);
settingsDeleteButtons.forEach((e) => {
    e.addEventListener("click", settingsDelete);
});

/********/
/* TRIP */
/********/
/* CONSTANTS */
const tripUpdateForm = document.querySelector("#trip-form");

/* FUNCTIONS */
function tripUpdateDocument() {
    console.log(this.responseText);
}

/* HANDLERS */
async function tripUpdate() {
    event.returnValue = false;

    const data = new FormData(this);

    httpRequest("POST", "/trip", data, tripUpdateDocument);
}

/* EVENT LISTENERS */
tripUpdateForm.addEventListener("submit", tripUpdate);

/***********/
/* PAYMENT */
/***********/
/* CONSTANTS */
const paymentUpdateForm = document.querySelector("#payment-form");

/* FUNCTIONS */
function paymentUpdateDocument() {
    console.log(this.responseText);
}

/* HANDLERS */
async function paymentUpdate() {
    event.returnValue = false;

    const data = new FormData(this);

    httpRequest("POST", "/payment", data, paymentUpdateDocument);
}

/* EVENT LISTENERS */
paymentUpdateForm.addEventListener("submit", paymentUpdate);

/********/
/* HOME */
/********/
/* CONSTANTS */
const homeDeleteButtons = document.querySelectorAll(".homeDelete");

/* FUNCTIONS */
function homeDeleteDocument() {
    console.log(this.response);
}

/* HANDLERS */
async function homeDelete() {
    event.returnValue = false;

    const data = new FormData();
    data.append("homeDelete", this.value);

    httpRequest("DELETE", "/home", data, homeDeleteDocument);
}

/* EVENT LISTENERS */
homeDeleteButtons.forEach((e) => {
    e.addEventListener("click", homeDelete);
});