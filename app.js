if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');

const flash = require("connect-flash");
//for authantication below 3 lines
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


// const MONGO_URL = "mongodb://127.0.0.1:27017/wonderlust";
const dbUrl = process.env.ATLASDB_URL;


main()
    .then(() => {
        console.log("Connected to db");
    })
    .catch((err) => {
        console.log(err);
    });
async function main() {
    await mongoose.connect(dbUrl);
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));//taki jo hamara req ke andar data aa raha hai woh parse hoo paye(show route wale ka hai)
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", () =>{
    console.log("Error in mongossion store");
})


const sessionOptions = {
    store, 
    secret:process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,

    }
};


// app.get("/", (req, res) => {
//     res.send("HI i amroot");
// });




app.use(session(sessionOptions));
app.use(flash()); //note : jab ham passport ko use karte hai authancation ke liye tb ham ye mahi chahte ki alag alag session ki alg alg session ke liye hamra passport changee ho toh hame session ki jarurat hoti hai

app.use(passport.initialize()); //isse har ek ppassport kke liye hamara middleware intitilize ho jayega // passport ko use karne se pahale hame use initilize karna paddega 
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req, res, next) => {
    res.locals.success = req.flash("success"); //koi bhi messsage ata hai success ala toh hamare response ke andar locals kke andar save ho jayegga 
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.all("*", (req, res, next) => {
    next(new ExpressError(404, " page not found!"));
});
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { message });
    // res.status(statusCode).send(message);
});

app.listen(8080, () => {
    console.log("server is listening");
});