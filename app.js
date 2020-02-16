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
    cost: Number,
    aCost: Number
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

// var trips = [];
// var setting = null;

///////////////////////////////////////////////////////////////////////////////
// FUNCTIONALITIES                                                         ///
/////////////////////////////////////////////////////////////////////////////
function connectDB() {
    mongoose.connect("mongodb+srv://admin:admin@cluster0-xtsjl.gcp.mongodb.net/trip", { useNewUrlParser: true, useUnifiedTopology: true });
}

function disconnectDB() {
    mongoose.connection.close();
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

function computeSummary(trips) {
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
/********/
/* ROOT */
/********/
function initDefault() {
    // connectDB();

    return new Promise(resolve => { // Add default setting
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
                    cost: 0,
                    aCost: 0
                });

                const setting = new Setting({
                    routes: [route]
                });

                setting.save().then(() => {
                    console.log("Added default setting.");
                });
            }
            resolve();
        })
    });

    // disconnectDB();
}

async function get(req, res) {

    connectDB();

    await initDefault();

    const setting = await new Promise(resolve => { // Get settings
        Setting.findOne(null, (err, obj) => {
            if (err) {
                console.log(err);

            } else {
                resolve(obj);
            }
        })
    });

    const trips = await new Promise(resolve => { // Get trips
        Trip.find({ payed: false }, (err, obj) => {
            if (err) {
                console.log(err);

            } else {
                resolve(obj.sort([["trip.date", -1]]));
            }
        })
    });

    disconnectDB();

    let date = toodayString();

    const summary = computeSummary(trips);

    res.render('index', {
        trips: trips,
        setting: setting,
        date: date,
        summary: summary
    });
}

/************/
/* SETTINGS */
/************/
/* FUNCTIONS */

/* HANDLERS */
async function settingsUpdate(req, res) {

    const newSettinsRoute = new Route({
        name: req.body.routeName,
        routeStart: req.body.routeStart,
        routeEnd: req.body.routeEnd,
        passengers: req.body.passengers,
        distance: req.body.distance,
        cost: req.body.cost,
        aCost: req.body.aCost
    });

    connectDB()

    await Setting.updateOne(
        null,
        { $push: { routes: newSettinsRoute } }
    );

    disconnectDB();

    res.status(200).send(newSettinsRoute);
}

async function settingsDelete(req, res) {
    const idToRemove = req.body.settingsDelete;

    connectDB();

    await Setting.updateOne(
        null,
        { $pull: { routes: { _id: idToRemove } } }
    );

    disconnectDB();

    res.send(idToRemove);
}

/********/
/* TRIP */
/********/
/* FUNCTIONS */

/* HANDLERS */
async function tripAdd(req, res) {

    req.body.passengers = Number(req.body.passengers);
    req.body.aCost = Number(req.body.aCost);

    const cost = ((req.body.cost * req.body.distance + req.body.aCost) / req.body.passengers);

    const newTrip = Trip({
        date: req.body.date,
        payed: false,
        route: new Route({
            name: req.body.routeName,
            routeStart: req.body.routeStart,
            routeEnd: req.body.routeEnd,
            passengers: req.body.passengers,
            distance: req.body.distance,
            cost: Math.round((cost + Number.EPSILON) * 100) / 100,
            aCost: req.body.aCost
        })
    });

    connectDB();

    await newTrip.save();

    disconnectDB();

    res.status(200).send(newTrip);
}

/***********/
/* PAYMENT */
/***********/
/* FUNCTIONS */

/* HANDLERS */
async function paymentUpdate(req, res) {

    connectDB();

    await Trip.updateMany(
        { date: { $lte: req.body.date } },
        { payed: true }
    );

    disconnectDB();

    res.send("[OK] paymentUpdate");
}

/********/
/* HOME */
/********/
/* FUNCTIONS */

/* HANDLERS */
async function homeDelete(req, res) {
    const idToRemove = req.body.homeDelete;

    connectDB();

    await Trip.findByIdAndDelete(idToRemove);

    disconnectDB();

    res.status(200).send(idToRemove);
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
    .put(update.none(), settingsUpdate)
    .delete(update.none(), settingsDelete);

/********/
/* TRIP */
/********/
app.route("/trip")
    .post(update.none(), tripAdd);

/***********/
/* PAYMENT */
/***********/
app.route("/payment")
    .put(update.none(), paymentUpdate);

/********/
/* HOME */
/********/
app.route("/home")
    .delete(update.none(), homeDelete);
