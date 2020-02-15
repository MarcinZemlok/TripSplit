const express = require("express");
const multer = require("multer");
const ejs = require("ejs");
const mongoose = require("mongoose");

///////////////////////////////////////////////////////////////////////////////
// SERVER INIT                                                             ///
/////////////////////////////////////////////////////////////////////////////
const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
// app.use(bodyParser.urlencoded({ extended: true }));
const update = multer();

const socket = process.env.PORT || 3000;
app.listen(socket, () => {
    console.log("Application running on port " + socket + ".");
});

///////////////////////////////////////////////////////////////////////////////
// DATABASE STRUCTURES                                                     ///
/////////////////////////////////////////////////////////////////////////////
const routeSchema = mongoose.Schema({
    name: String,
    routeStart: String,
    routeEnd: String,
    passengers: Number,
    distance: Number,
    cost: Number
});

const tripSchema = mongoose.Schema({
    route: routeSchema,
    date: Date,
    payed: Boolean
});

const settingSchema = mongoose.Schema({
    routes: [routeSchema]
});

const Route = mongoose.model("Route", routeSchema);
const Trip = mongoose.model("Trip", tripSchema);
const Setting = mongoose.model("Setting", settingSchema);

var trips = [];
var setting = null;

///////////////////////////////////////////////////////////////////////////////
// FUNCTIONALITIES                                                         ///
/////////////////////////////////////////////////////////////////////////////
function connectDB() {
    mongoose.connect("mongodb+srv://admin:admin@cluster0-xtsjl.gcp.mongodb.net/trip", { useNewUrlParser: true, useUnifiedTopology: true });
}

function disconnectDB() {
    mongoose.connection.close();
}

function processSettings(data) {
    if (data.routeDelete) {
        console.log("Removing route: " + data.routeDelete);
        const _id = data.routeDelete;

        setting.routes.forEach((e, i) => {
            if (e._id == _id) {
                setting.routes.splice(i, 1);
            }
        });

    } else {
        console.log("Adding new route:");

        const route = new Route({
            name: data.routeName,
            routeStart: data.routeStart,
            routeEnd: data.routeEnd,
            distance: data.distance,
            cost: data.cost,
            passengers: data.passengers
        });

        setting.routes.push(route);
    }

    return setting.save();
}

function toodayString() {
    const date = new Date(Date.now());

    let day = date.getDate();
    if (day < 10) day = "0" + day;

    let month = date.getMonth() + 1;
    if (month < 10) month = "0" + month;

    let year = date.getFullYear();
    year = year.toString();

    return `${year}-${month}-${day}`;
}

function computeSummary() {
    const summary = {
        distance: 0,
        cost: 0,
        timeSpan: ""
    };

    if (trips.length === 0) return summary;

    let month = null;
    summary.timeSpan = "(";

    trips.forEach((t) => {
        summary.distance += t.route.distance;
        summary.cost += t.route.cost;

        const dd = t.date.getDate();
        const mm = t.date.getMonth() + 1;

        if (month === null) {
            month = mm;
        }
        if (month != mm) {
            summary.timeSpan += " ) / " + month + " ; ( " + dd;
            month = mm;
        } else {
            summary.timeSpan += " " + dd;
        }
    });
    summary.timeSpan += " ) / " + month;

    return summary;
}

///////////////////////////////////////////////////////////////////////////////
// CALLBACKS                                                               ///
/////////////////////////////////////////////////////////////////////////////
async function init() {
    connectDB();

    await new Promise(resolve => {
        Setting.countDocuments(null, (err, dbres) => {
            if (err) {
                console.log(err);

            } else if (dbres === 0) {
                const route = new Route({
                    name: "Your first route",
                    routeStart: "New York",
                    routeEnd: "London",
                    passengers: "5",
                    distance: 5567,
                    cost: 0
                });

                setting = new Setting({
                    routes: [route]
                });

                setting.save().then(() => {
                    console.log("Added default setting.");
                });
            }
            resolve();
        })
    });

    await new Promise(resolve => {
        Setting.find(null, (err, dbres) => {
            if (err) {
                console.log(err);
            } else {
                setting = dbres[0];
            }
            resolve();
        })
    });

    await new Promise(resolve => {
        Trip.find({ payed: false }).sort([["trip.date", -1]]).exec((err, dbres) => {
            if (err) {
                console.log(err);
            } else if (dbres) {
                trips = dbres;
            }
            resolve();
        });
    });

    disconnectDB();
}

async function get(req, res) {
    await init();

    let date = toodayString();

    const summary = computeSummary();

    res.render('index', {
        trips: trips,
        setting: setting,
        date: date,
        summary: summary
    });
}

async function post(req, res) {

    connectDB();

    let data = req.body;

    if (req.params.site == "settings") await processSettings(data);
    else if (req.params.site == "add") {
        if (data.passengers) {

            const trip = new Trip({
                routeStart: data.routeStart,
                routeEnd: data.routeEnd,
                passengers: data.passengers,
                date: data.date,
                distance: 53,
                cost: 22,
                payed: false
            });

            await trip.save();
        } else {

            await Trip.updateMany(
                { $and: [{ payed: false }, { date: { $lt: data.date } }] },
                { payed: true },
                (err, dbres) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Added new payment.");
                        console.log(dbres);
                    }
                });
        }
    }

    disconnectDB();
    res.redirect("/");
}

/************/
/* SETTINGS */
/************/
/* FUNCTIONS */

/* HANDLERS */
async function settingsUpdate(req, res) {
    console.log(req.body);

    res.send("[OK] settingsUpdate");
}

async function settingsDelete(req, res) {
    console.log(req.body);

    res.send("[OK] settingsDelete");
}

/********/
/* TRIP */
/********/
/* FUNCTIONS */

/* HANDLERS */
async function tripUpdate(req, res) {
    console.log(req.body);

    res.send("[OK] tripUpdate");
}

/***********/
/* PAYMENT */
/***********/
/* FUNCTIONS */

/* HANDLERS */
async function paymentUpdate(req, res) {
    console.log(req.body);

    res.send("[OK] paymentUpdate");
}

/********/
/* HOME */
/********/
/* FUNCTIONS */

/* HANDLERS */
async function homeDelete(req, res) {
    console.log(req.body);

    res.send("[OK] homeDelete");
}

///////////////////////////////////////////////////////////////////////////////
// SERVER ROUTE                                                            ///
/////////////////////////////////////////////////////////////////////////////
/********/
/* MAIN */
/********/
app.get("/", get);

/************/
/* SETTINGS */
/************/
app.route("/settings")
    .post(update.none(), settingsUpdate)
    .delete(update.none(), settingsDelete);

/********/
/* TRIP */
/********/
app.route("/trip")
    .post(update.none(), tripUpdate);

/***********/
/* PAYMENT */
/***********/
app.route("/payment")
    .post(update.none(), paymentUpdate);

/********/
/* HOME */
/********/
app.route("/home")
    .delete(update.none(), homeDelete);
