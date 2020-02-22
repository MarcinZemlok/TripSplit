/*//////////////////////////////////////////////////////////////////////////////
///                                 TripSplit                                ///
//============================================================================//
//        Author: Marcin Żemlok
//         Email: marcinzemlok@gmail.com
//       Version: 1.1
//
//   Description: TripSplit application client side functionality.
//
// Creation date: 19/02/2020
================================== CHANGE LOG ==================================
// [19/02/2020]        Marcin Żemlok
        Initial change log entry. Added mobile responsivnes.                 ///
--------------------------------------------------------------------------------
// [22/02/2020]        Marcin Żemlok
        * Changed the way that new entries are added. Now whole table body
         content is recieved.
        * Added summary update on adding new trip.                           ///
//////////////////////////////////////////////////////////////////////////////*/
///////////////////////////////////////////////////////////////////////////////
// TAB SCROLL                                                              ///
/////////////////////////////////////////////////////////////////////////////
function tabScroll(e) {
    let target = this;
    if (e.fakeTarget) {
        target = e.fakeTarget;
    }

    const th = target.offsetHeight;
    const bh = document.querySelector("body").offsetHeight;

    let toff = Number(target.style.top.slice(0, -2));

    toff -= e.deltaY / Math.abs(e.deltaY) * 28;

    let ret = false;
    if (toff > 0) {
        toff = 0;
        ret = true;
    } else if (toff < (bh - th)) {
        toff = (bh - th);
    }

    target.style.top = "" + toff + "px";

    return ret;
}

document.querySelectorAll(".tab").forEach((c) => {
    c.addEventListener("wheel", tabScroll);
});

///////////////////////////////////////////////////////////////////////////////
// RESPONSIVNESS                                                           ///
/////////////////////////////////////////////////////////////////////////////
/**************/
/* NAVIGATION */
/**************/
/* VARIABLES */
var touchStartX = null;
var touchCurrentX = null;
var touchStartY = null;
var touchCurrentY = null;
var lastDel = null;

/* EVENT LISTENERS */
document.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].screenX;
    touchStartY = e.touches[0].screenY;
});
document.addEventListener("touchmove", (e) => {
    touchCurrentX = e.touches[0].screenX;
    touchCurrentY = e.touches[0].screenY;
});
document.addEventListener("touchend", (e) => {
    const delX = touchStartX - touchCurrentX;
    const delY = touchStartY - touchCurrentY;

    const nav = document.querySelector(".nav-container");

    if (delX < -100) {
        nav.classList.add("nav-container-visible");
    } else if (delX > 100) {
        nav.classList.remove("nav-container-visible");
    }

    // let target = e.target;
    // while(! target.classList.contains("tab")) {
    //     target = target.parentNode;
    // }

    // const fakeE = {
    //     deltaY: delY,
    //     fakeTarget: target
    // };
    // if(tabScroll(fakeE) && delY < -100) {
    //     console.log(delY);
    //     location.reload()
    // }

    touchStartX = null;
    touchCurrentX = null;
    touchStartY = null;
    touchCurrentY = null;
    lastDel = null;
});

///////////////////////////////////////////////////////////////////////////////
// API                                                                     ///
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

var i = 0;
/* FUNCTIONS */
function settingsUpdateDocument() {

    if (this.readyState === 4 && this.status === 200) {

        document.querySelector("#settings > table tbody").innerHTML = this.responseText;
    }
}

function settingsDeleteDocument() {

    if (this.readyState === 4 && this.status === 200) {

        const removeButton = document.querySelector(`#settings button[value="${this.responseText}"]`);

        const removeRow = removeButton.parentNode.parentNode;

        const settingsTable = removeRow.parentNode;

        settingsTable.removeChild(removeRow);
    }
}

/* HANDLERS */
async function settingsUpdate() {
    event.returnValue = false;

    const data = new FormData(this);

    httpRequest("PUT", "/settings", data, settingsUpdateDocument);
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
const tripAddForm = document.querySelector("#trip-form");

/* FUNCTIONS */
function tripAddDocument() {

    if (this.readyState === 4 && this.status === 200) {
        const res = JSON.parse(this.responseText);

        document.querySelector("#home > table tbody").innerHTML = res.trips;
        document.querySelector("#home > .summary-container").innerHTML = res.summary;


        alert("Trip has been added \u2705");
    }
}

/* HANDLERS */
async function tripAdd() {
    event.returnValue = false;

    const data = new FormData(this);

    httpRequest("POST", "/trip", data, tripAddDocument);
}

/* EVENT LISTENERS */
tripAddForm.addEventListener("submit", tripAdd);

/***********/
/* PAYMENT */
/***********/
/* CONSTANTS */
const paymentUpdateForm = document.querySelector("#payment-form");

/* FUNCTIONS */
function paymentUpdateDocument() {
    if (this.readyState === 4 && this.status === 200) {
        alert("Payment has been saved \u2705");
        location.reload();
    }
}

/* HANDLERS */
async function paymentUpdate() {
    event.returnValue = false;

    const data = new FormData(this);

    httpRequest("PUT", "/payment", data, paymentUpdateDocument);
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

    if (this.readyState === 4 && this.status === 200) {

        const removeButton = document.querySelector(`#home button[value="${this.responseText}"]`);

        const removeRow = removeButton.parentNode.parentNode;

        const settingsTable = removeRow.parentNode;

        settingsTable.removeChild(removeRow);
    }
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