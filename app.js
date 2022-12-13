const express = require("express");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const passport = require("passport");
require("./config/passport")(passport);
const cors = require("cors");

const app = express();
const port = process.env.PORT || 7070;
app.use(require("helmet")());
app.use(cors());

/* handlebars */
require("./config/handlebars")(app);

/* connect to db */
require("./config/connectDB")();

// Express session middleware
app.use(
    session({
        secret: "secret",
        resave: true,
        saveUninitialized: true,
    })
);
app.use(flash());

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Global variables
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    res.locals.user = req.user || null;
    res.locals.whatsapp = "";
    res.locals.adminWhatsApp = "";
    res.locals.websiteName = "GEMINI INVESTMENTS";
    res.locals.websiteMail = "support@geminiinvestments.co.uk";
    next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride("_method"));

/* public assets */
app.use(express.static(path.join(__dirname, "public")));
app.use("/npm", express.static(path.join(__dirname, "node_modules")));

/* routes */
require("./config/routes")(app);

/* start server */
app.listen(port, () => { console.log(`Server running: http://localhost:${port}`) });