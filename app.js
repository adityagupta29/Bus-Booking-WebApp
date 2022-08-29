const express = require('express')
const bodyParser = require('body-parser')
const _ = require("lodash");
const mongoose = require("mongoose");
const nodemailer = require('nodemailer');
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const {
    render, type
} = require('express/lib/response');


require('dotenv').config();

const app = express()

app.use(session({
    secret: "adityaag29000000@gmail.com",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
mongoose.connect("mongodb://localhost:27017/couponDB", {
    useNewUrlParser: true
});

const busSchema = {
    link: String,
    name: String,
    number: String,
    type: String,
    from: String,
    to: String,
    hourlyRate: String,
    bookingRate: String,
    busProvider: String,
    busProviderEmail: String,
    available: Boolean
};

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    agencyname: String
});

const busBookedSchema = {
    busNumber: String,
    busProvider: String,
    pickupLocation: String,
    dropLocation: String,
    name: String,
    contact: String,
    date: String,
    time: String
}


userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);


passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});


const Bus = mongoose.model("Bus", busSchema);
const BusBooked = mongoose.model("BusBooked", busBookedSchema);

app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}))

app.get("/", function (req, res) {
    Bus.find({
        available: true
    }, function (err, bus) {
        if (req.isAuthenticated()){
            res.render("home", {
                data: bus, login: true
            });
        } else {
            res.render("home", {
                data: bus, login: false
            });
        }   
        
    });
})

app.post("/dashboard", (req, res) => {
    const bus = new Bus({
        link: (req.body.number).replace(/ /g, "-"),
        name: req.user.agencyname,
        number: req.body.number,
        type: req.body.type,
        from: req.body.from,
        to: req.body.to,
        hourlyRate: req.body.hourlyRate,
        bookingRate: req.body.bookingRate,
        busProvider: req.user.agencyname,
        busProviderEmail: req.user.username,
        available: true
    });

    bus.save(function (err) {
        if (!err) {
            res.redirect("/");
        } else {
            throw err;
        }

    });
})

app.post("/confirmbooking", (req, res) => {
    const busBooked = new BusBooked({
        busNumber: req.body.busNumber,
        busProviderUsername: req.body.busProviderEmail,
        pickupLocation: req.body.pickupLocation,
        dropLocation: req.body.dropLocation,
        name: req.body.name,
        contact: req.body.contact,
        date: req.body.date,
        time: req.body.time,
    });

    busBooked.save(function (err) {
        if (!err) {
            res.redirect("/");
        } else {
            throw err;
        }
    });
})

app.post("/bookbus", function (req, res) {
    const requestedBusNumber = req.body.busNumber;
    console.log(requestedBusNumber);
        if (req.isAuthenticated()){
            Bus.find({
                number: requestedBusNumber
            }, function (err, bus) {
                res.render("bookbus", {
                    data: bus, username: req.user.username
                }); 
            });
        } else {
            res.redirect('login');
        }   
});

app.get("/dashboard", function (req, res) {
        if (req.isAuthenticated()){
            BusBooked.find({
                busProviderUsername: req.user.username
            }, function (err, user) {
                res.render("registerBus", {
                    data: user, username: req.user.username, agencyname: req.user.agencyname
                }); 
            });
        } else {
            res.redirect('login');
        }
});

app.get("/login", function (req, res) {
    res.render("login", {
        error: ""
    });
});

app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});

app.get("/register", function (req, res) {
    res.render("register", {
        error: ""
    });
});


app.post("/register", function (req, res) {
    const agencyName = req.body.agencyname;
        User.register({
            username: req.body.username
        }, req.body.password, function (err, user) {
            if (err) {
                res.render("register", {
                    error: "Account Creation Failed"
                });
            } else {
                passport.authenticate("local")(req, res, function () {
                    User.findById(req.user.id, (err, foundUser) => {
                        if (err) {
                            res.render("register", {
                                error: "Account Creation Failed"
                            });
                        } else {
                            if (foundUser) {
                                foundUser.agencyname = agencyName;
                                foundUser.save(function () {
                                    res.redirect('/');
                                })
                            }
                        }
                    })
                });
            };
        });
});

app.post("/login", function (req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function (err) {
        if (err) {
            res.render("login", {
                error: "Wrong Email or Password"
            });
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/");
            });
        }
    });

});


app.listen(3000, (req, res) => {
    console.log("App is running on port 3000")
})