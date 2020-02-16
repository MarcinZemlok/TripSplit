///////////////////////////////////////////////////////////////////////////////
// TAB SCROLL                                                              ///
/////////////////////////////////////////////////////////////////////////////
function tabScroll(e) {
    const th = this.offsetHeight;
    const bh = document.querySelector("body").offsetHeight;

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

var i = 0;
/* FUNCTIONS */
function settingsUpdateDocument() {

    if (this.readyState === 4 && this.status === 200) {

        const res = JSON.parse(this.responseText);

        const newRow = document.createElement("tr");

        newRow.innerHTML = `<td>${res.name}</td>
                            <td>${res.routeStart}</td>
                            <td>${res.routeEnd}</td>
                            <td>${res.distance} km</td>
                            <td>${res.cost} zl</td>
                            <td>${res.aCost} zl</td>
                            <td>${res.passengers}</td>
                            <td class="settings-button">
                                <button class="settingsDelete" value="${res._id}">-</button>
                            </td>`;

        newRow.querySelector("button").addEventListener("click", settingsDelete);

        document.querySelector("#settings tbody").appendChild(newRow);
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

        const date = new Date(res.date).toLocaleString("pl-PL", { year: "numeric", month: "2-digit", day: "2-digit" });

        const newRow = document.createElement("tr");

        newRow.innerHTML = `<td>${date}</td>
                            <td>${res.route.name}</td>
                            <td>${res.route.routeStart}</td>
                            <td>${res.route.routeEnd}</td>
                            <td>${res.route.distance} km</td>
                            <td>${res.route.cost} zl</td>
                            <td>${res.route.passengers}</td>
                            <td class="settings-button">
                                <button class="homeDelete" value="${res._id}">-</button>
                            </td>`;

        newRow.querySelector("button").addEventListener("click", homeDelete);

        document.querySelector("#home tbody").appendChild(newRow);
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