const router = require("express").Router();
const Message = require("../../models/Message");
const User = require("../../models/User");
const passport = require("passport");
const mongoose = require("mongoose");
const multer = require("multer");
const cloudinary = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

/* Cloudinary config */

cloudinary.config({
  cloud_name: "centruimfx",
  api_key: "754611959874264",
  api_secret: "XOwsWy-aLlxxluPPe_nFmHZ0OQs",
});
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  folder: "uploads2",
  allowedFormats: ["jpg", "png", "jpeg"],
  // transformation: [{ width: 500, height: 500, crop: "limit" }],
});
const parser = multer({ storage: storage });

router.post(
  "/kyc-upload/:userId/front",
  parser.single("uploadFront"),
  async (req, res) => {
    try {
      const file = req.file.secure_url;

      await User.findByIdAndUpdate(req.params.id, {
        $set: {
          uploadFront: file,
        },
      });

      req.flash("success_msg", "KYC front upload successful!");
      res.redirect("/verify-account/" + req.params.userId);
    } catch (error) {
      req.flash("error_msg", `Upload failed! ${error.message}`);
      res.redirect("/verify-account/" + req.params.userId);
    }
  }
);

router.post(
  "/kyc-upload/:userId/back",
  parser.single("uploadBack"),
  async (req, res) => {
    try {
      const file = req.file.secure_url;

      await User.findByIdAndUpdate(req.params.id, {
        $set: {
          uploadBack: file,
        },
      });

      req.flash("success_msg", "KYC back upload successful!");
      res.redirect("/verify-account/" + req.params.userId);
    } catch (error) {
      req.flash("error_msg", `Upload failed! ${error.message}`);
      res.redirect("/verify-account/" + req.params.userId);
    }
  }
);

router.get("/", async (req, res) => res.render("site/index"));

router.get("/about", async (req, res) => res.render("site/about"));

// router.get("/pricing-table", async (req, res) =>
//   res.render("site/pricing_table")
// );

router.get("/verify-account/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const isValidUserId = mongoose.isValidObjectId(userId);

    if (!isValidUserId) {
      req.flash(
        "error_msg",
        "There is no user found in this current session to be verified! Please login and retry this process."
      );
      return res.redirect("/login");
    }

    const user = await User.findById(userId);

    if (!user) {
      req.flash(
        "error_msg",
        "There is no user found in this current session to be verified! Please login and retry this process."
      );
      return res.redirect("/login");
    }

    res.render("site/verify-account", {
      userId: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      profilePic: user.profilePic,
      uploadFront: user.uploadFront,
      uploadBack: user.uploadBack,
      layout: "auth",
    });
  } catch (error) {
    req.flash("error_msg", error.message);
    res.redirect("/login");
  }
});

router.get("/faq", async (req, res) => res.render("site/faq"));

// router.get("/terms", async (req, res) => res.render("site/terms"));

router.get("/contact", async (req, res) => res.render("site/contact"));

router.get("/login", async (req, res, next) => {
  const { email, password } = req.query;

  // direct link login
  if (email) {
    passport.authenticate("local", {
      successRedirect: "/dashboard",
      failureRedirect: "/login",
      failureFlash: true,
    })(req, res, next);
    return;
  }

  res.render("site/login", { layout: "auth" });
});

router.get("/register", async (req, res) =>
  res.render("site/signup", { layout: "auth" })
);

// router.get("/referral-program", async (req, res) => res.render("site/refer"));

/* messages */
router.post("/message", async (req, res) => {
  const { name, email, subject, phone, message } = req.body;

  const msg = new Message({
    name,
    email,
    subject,
    phone,
    message,
  });

  await msg.save();
  res.render("site/message-sent");
});

module.exports = router;
