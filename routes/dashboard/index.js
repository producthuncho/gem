// @route '/dashboard'
const router = require("express").Router();
const layout = "account2";
const serverError = "/error/error-500";
const { auth } = require("../../helpers/auth");
const User = require("../../models/User");
const Withdraw = require("../../models/Withdraw");
const Wallet = require("../../models/Wallet");
const Whatsapp = require("../../models/Whatsapp");
const Activity = require("../../models/Activity");
const Message = require("../../models/Message");
const bcrypt = require("bcryptjs");

router.route("/").get(auth, async (req, res) => {
  if (req.user.control) {
    return res.redirect("/dashboard/manage");
  }

  const transactions = await Withdraw.find({ user: req.user._id })
    .sort({
      _id: -1,
    })
    .limit(5);

  res.render("dashboard/account", { layout: "account2", transactions });
});

router.get("/plans", auth, async (req, res) => {
  res.render("dashboard/plans", { layout });
});

router.get("/2fa", auth, async (req, res) => {
  res.render("dashboard/2fa", { layout });
});

router.get("/wallet", auth, async (req, res) => {
  res.render("dashboard/wallet", { layout });
});

router.post("/wallet", auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { wallet: req.body.wallet });
    req.flash("success_msg", "Wallet changed successfully!");
    res.redirect("/dashboard/wallet");
  } catch (error) {
    req.flash("error_msg", error.message);
    res.redirect("/dashboard/wallet");
  }
});

router.post("/2fa", auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { twoFA: true });
    req.flash("success_msg", "2FA activated for this account!");
    res.redirect("/dashboard/2fa");
  } catch (error) {
    req.flash("error_msg", error.message);
    res.redirect("/dashboard/2fa");
  }
});

router.get("/manage-account", auth, async (req, res) => {
  res.render("dashboard/profile/manage-account", { layout: "account2" });
});

router.post("/profile/change-password", auth, async (req, res) => {
  const { oldPassword, newPassword, confirmNewPassword } = req.body;

  if (!oldPassword || !newPassword || !confirmNewPassword) {
    req.flash(
      "error_msg",
      "Missing field! Please fill all fields in the form."
    );
    return res.redirect("/dashboard/manage-account");
  }

  if (newPassword !== confirmNewPassword) {
    req.flash(
      "error_msg",
      "The new password does not match with the confirm password field."
    );
    return res.redirect("/dashboard/manage-account");
  }

  try {
    const user = await User.findById(req.user._id);

    const passwordMatched = await bcrypt.compare(oldPassword, user.password);

    if (!passwordMatched) {
      req.flash("error_msg", "Your account password you entered is incorrect.");
      return res.redirect("/dashboard/manage-account");
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    req.flash(
      "success_msg",
      "Your account password has been successfully changed!"
    );
    res.redirect("/dashboard/manage-account");
  } catch (error) {
    req.flash("error_msg", error.message);
    res.redirect("/dashboard/manage-account");
  }
});

/* deposit */
router
  .route("/deposit")
  .get(auth, async (req, res) => {
    res.render("dashboard/deposit/index", { layout: "account2" });
  })
  .post(auth, async (req, res) => {
    const { amount, btc } = req.body;

    const wallet = await Wallet.findOne().sort({ _id: "desc" }).select("-user");
    const deposit = new Withdraw({
      user: req.user._id,
      amount,
      transaction_type: "Deposit",
    });
    await deposit.save();
    res.render("dashboard/deposit/complete", { layout, wallet, amount, btc });
  });

/* upload proof of payment */
router.post("/deposit/upload-proof", auth, async (req, res) => {
  req.flash("success_msg", "Deposit order submitted and is pending...");
  res.redirect("/dashboard/activities?history=transaction");
});

/* withdraw */
router
  .route("/withdraw")
  .get(auth, async (req, res) => {
    const whatsapp = await Whatsapp.findOne()
      .sort({ _id: "desc" })
      .select("-user");
    res.render("dashboard/withdraw/index", { layout, whatsapp });
  })
  .post(auth, async (req, res) => {
    try {
      const { amount, wallet, security_code } = req.body;
      if (security_code !== "5595") {
        req.flash(
          "error_msg",
          "Invalid security code! Contact manager to get your security code."
        );
        return res.redirect("/dashboard/withdraw");
      }
      if (req.user.balance < amount) {
        req.flash("error_msg", "Insufficient account balance!");
        return res.redirect("/dashboard/withdraw");
      }

      let withdraw = new Withdraw({
        user: req.user._id,
        amount,
        wallet,
        transaction_type: "Withdrawal",
      });

      withdrawal = await withdraw.save();

      req.user.balance -= parseFloat(amount);
      await req.user.save();

      req.flash(
        "success_msg",
        "Your withdrawal request will be approved within 24hrs."
      );
      res.redirect("/dashboard/activities?history=transaction");
    } catch (error) {
      console.log(error);
      res.redirect(serverError);
    }
  });

/* activities */
router.route("/activities").get(auth, async (req, res) => {
  const withdrawals = await Withdraw.find({ user: req.user._id }).sort({
    date: "desc",
  });
  const activities = await Activity.find().sort({ _id: "desc" });
  const admin_wallet = await Wallet.findOne()
    .sort({ date: "desc" })
    .select("wallet");

  let tradeHistory = false;
  let transactionHistory = false;
  if (req.query.history === "trade") tradeHistory = true;
  if (req.query.history === "transaction") transactionHistory = true;

  res.render("dashboard/activities", {
    layout,
    withdrawals,
    activities,
    admin_wallet,
    tradeHistory,
    transactionHistory,
  });
});

/* profile */
router
  .route("/profile")
  .get(auth, async (req, res) => {
    res.render("dashboard/profile/index", { layout });
  })
  .post(auth, async (req, res) => {
    try {
      const { firstname, lastname, email, country, phone } = req.body;
      const obj = { firstname, lastname, email, country, phone };
      const user = await User.findOneAndUpdate({ email }, obj);

      req.flash("success_msg", "Profile information updated!");
      res.redirect("/dashboard/profile");
    } catch (error) {
      console.log(error);
      res.redirect(serverError);
    }
  });

router.post("/profile/change-password", auth, async (req, res) => {
  const rurl = "/dashboard/profile";
  const { old_password, new_password, c_password } = req.body;

  if (new_password !== c_password) {
    req.flash("error_msg", "New password do not match confirm password");
    return res.redirect(rurl);
  }

  try {
    const user = await User.findById({ _id: req.user._id });
    const passwordMatch = await bcrypt.compare(old_password, user.password);

    if (!passwordMatch) {
      req.flash(
        "error_msg",
        "Wrong old password. Check your password and try again."
      );
      return res.redirect("/login");
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(new_password, salt);
    await user.save();

    req.flash(
      "success_msg",
      `Password changed successfully! New password - ${new_password}`
    );
    res.redirect(rurl);
  } catch (error) {
    console.log(error.message);
    res.redirect(rurl);
  }
});

module.exports = router;
