const router = require("express").Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const serverEror = "/error/error-500";
const eventEmitter = require("../events");

const User = require("../models/User");

// make post request here too
/* login */
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, next);
});

// Logout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You logged out! Login again.");
  res.redirect("/login");
});

/* post registration form */
router.post("/register", async (req, res) => {
  try {
    const { firstname, lastname, email, country, phone, password, cpassword } =
      req.body;

    if (password !== cpassword) {
      return res.render("site/signup", {
        firstname,
        lastname,
        email,
        country,
        phone,
        mismatch: true,
      });
    }

    let user = await User.findOne({ email });
    if (user) {
      req.flash("error_msg", "A user with this email address already exists.");
      return res.redirect("/signup");
    }

    user = new User({
      firstname,
      lastname,
      email,
      country,
      phone,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // check if user is first, then make admin:
    const totalUsers = await User.find().lean();

    if (totalUsers.length === 0) {
      user.control = true;
    }

    await user.save();

    // send mail to both user and admin:
    eventEmitter.emit("user.signup", {
      email,
      firstname,
      lastname,
      password,
      country,
    });

    req.flash(
      "success_msg",
      `Hello ${user.firstname}, your account has been created successfully!`
    );

    res.redirect("/login");
  } catch (error) {
    console.log(error);
    res.redirect(serverEror);
  }
});

module.exports = router;
