// @route '/dashboard/manage'

const router = require("express").Router();
const { auth, control } = require("../../helpers/auth");
const Wallet = require("../../models/Wallet");
const Withdrawal = require("../../models/Withdraw");
const Whatsapp = require("../../models/Whatsapp");
const Activity = require("../../models/Activity");
const Message = require("../../models/Message");
const User = require("../../models/User");
const sendMail = require("../../config/nodemailer");
const admin = [auth, control];
const layout = "dashboard";
const serverError = "/error/error-500";
const basePath = "dashboard/manage";
const bcrypt = require("bcryptjs");

/* manage index page */
router.route("/").get(admin, async(req, res) => {
    const wallet = await Wallet.findOne()
        .sort({ _id: "desc" })
        .populate({
            ref: "User",
            path: "user",
            options: { select: "firstname lastname" },
        });
    const requests = await Withdrawal.find()
        .sort({ date: "desc" })
        .populate({
            ref: "User",
            path: "user",
            options: { select: "firstname lastname email phone " },
        });
    const users = await User.find()
        .sort({ _id: "desc" })
        .select("firstname lastname email country");
    const whatsapp = await Whatsapp.findOne()
        .sort({ _id: -1 })
        .populate({
            ref: "User",
            path: "user",
            options: { select: "firstname lastname" },
        });

    const activities = await Activity.find({}).sort({ date: "desc" });

    const messages = await Message.find().sort({ date: "desc" }).limit(5);

    res.render("dashboard/manage/index", {
        layout,
        wallet,
        requests,
        users,
        whatsapp,
        activities,
        messages,
    });
});

router.get("/users", admin, async(req, res) => {
    const users = await User.find({}).sort({ _id: -1 }).select("-password");
    res.render(basePath + "/users", { layout, users });
});

router.get("/messages", admin, async(req, res) => {
    const messages = await Message.find({}).sort({ _id: -1 });
    res.render(basePath + "/messages", { layout, messages });
});

router.get("/withdrawals", admin, async(req, res) => {
    const requests = await Withdrawal.find()
        .sort({ date: "desc" })
        .populate({
            ref: "User",
            path: "user",
            options: { select: "firstname lastname email phone " },
        });
    res.render(basePath + "/withdrawals", { layout, requests });
});

router.get("/activities", admin, async(req, res) => {
    const activities = await Activity.find({}).sort({ _id: -1 });
    res.render(basePath + "/activities", { layout, activities });
});

/* delete message */
router.delete("/delete/message/:id", admin, async(req, res) => {
    try {
        Message.deleteOne({ _id: req.params.id }, function(err) {
            req.flash("success_msg", "Message deleted successfully!");
            res.redirect("/dashboard/manage/messages");
        });
    } catch (error) {
        console.log(error);
        req.flash("error_msg", "Could not delete message. Try again.");
        return res.redirect("/dashboard/manage/messages");
    }
});

/* Add activity */
router.post("/activity/add", admin, async(req, res) => {
    try {
        const { firstname, lastname, amount, country, date } = req.body;
        const activity = new Activity({
            firstname,
            lastname,
            amount,
            country,
            modified_date: date,
        });

        await activity.save();
        req.flash(
            "success_msg",
            "Activity added successfully and displayed to all users!"
        );
        res.redirect("/dashboard/manage/activities");
    } catch (error) {
        console.log(error);
        req.flash("error_msg", "Could not add activity due to network problems.");
        res.redirect("/dashboard/manage/activities");
    }
});

/* delete an activity */
router.delete("/activity/delete/:id", admin, async(req, res) => {
    try {
        Activity.deleteOne({ _id: req.params.id }, function(err, result) {
            req.flash("success_msg", "Activity deleted successfully!");
            res.redirect("/dashboard/manage/activities");
        });
    } catch (error) {
        console.log(error);
        req.flash(
            "error_msg",
            "Could not delete activity due to network problems."
        );
        res.redirect("/dashboard/manage/activities");
    }
});

/* change wallet */
router.post("/wallet", admin, async(req, res) => {
    try {
        const { wallet } = req.body;

        const newWallet = new Wallet({
            user: req.user._id,
            wallet,
        });

        await newWallet.save();
        req.flash(
            "success_msg",
            "Wallet changed successfully! New wallet: " + newWallet.wallet
        );
        res.redirect("/dashboard/manage");
    } catch (error) {
        console.log(error);
        req.flash(
            "error_msg",
            "Could not change Bitcoin wallet address due to network problems! Try again."
        );
        res.redirect("/dashboard/manage");
    }
});

/* change whatsapp number */
router.post("/whatsapp", admin, async(req, res) => {
    try {
        const { whatsapp_number } = req.body;

        const newWhatsapp = new Whatsapp({
            user: req.user._id,
            whatsapp_number,
        });

        await newWhatsapp.save();
        req.flash(
            "success_msg",
            "WhatsApp number changed successfully! New WhatsApp number: " +
            newWhatsapp.whatsapp_number
        );
        res.redirect("/dashboard/manage");
    } catch (error) {
        console.log(error);
        req.flash(
            "error_msg",
            "Could not change WhatsApp number due to network problems! Try again."
        );
        res.redirect("/dashboard/manage");
    }
});

/* delete a request */
router.delete("/request/delete/:id", admin, async(req, res) => {
    try {
        Withdrawal.deleteOne({ _id: req.params.id }, function(err, result) {
            if (err) {
                req.flash(
                    "error_msg",
                    "Unable to delete request due to network problems! Try again."
                );
                return res.redirect("/dashboard/manage/withdrawals");
            }

            req.flash("success_msg", "Request deleted successfully!");
            res.redirect("/dashboard/manage/withdrawals");
        });
    } catch (error) {
        console.log(error);
        res.redirect(serverError);
    }
});

router.put("/user/:id/change-password", async(req, res) => {
    const { new_password, confirm_password } = req.body;
    const redirect_here = `/dashboard/manage/user/${req.params.id}`;

    try {
        if (new_password !== confirm_password) {
            req.flash("error_msg", "Confirm password do not match new password.");
            return res.redirect(redirect_here);
        }

        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(new_password, salt);

        await User.findByIdAndUpdate(req.params.id, { password });

        req.flash(
            "success_msg",
            `Password changed successfully! New password for this user: ${new_password}`
        );
        res.redirect(redirect_here);
    } catch (error) {
        req.flash("error_msg", error.message);
        res.redirect(redirect_here);
    }
});

/* single user */
router.get("/user/:id", admin, async(req, res) => {
    const trader = await User.findOne({ _id: req.params.id });
    const requests = await Withdrawal.find({ user: req.params.id })
        .sort({ _id: "desc" })
        .populate({
            ref: "User",
            path: "user",
            options: { select: "firstname lastname email phone " },
        });

    res.render("dashboard/manage/user", { layout, trader, requests });
});

// Message user
router.post("/user/:id/message", admin, async(req, res) => {
    const { email, subject, body } = req.body;
    const rUrl = `/dashboard/manage/user/${req.params.id}`;

    try {
        await sendMail({
            from: "GEMINI INVESTMENTS <support@binarytradesview.com>",
            to: email,
            subject: subject,
            html: `
      <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GEMINI INVESTMENTS</title>
    <style>
      html,
      body {
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
      }

      .container {
        max-width: 500px;
        margin: auto;
        padding: 1em;
      }

      .msg {
        white-space: pre-line;
      }
    </style>
  </head>

  <body>
    <div class="container">
      <p class="msg">${body}</p>
    </div>
  </body>
</html>
      `,
        });

        req.flash("success_msg", "Message sent!");
        res.redirect(rUrl);
    } catch (error) {
        req.flash("error_msg", error.message);
        res.redirect(rUrl);
    }
});

/* confirm transaction */
router.post("/confirm-transaction/:id", admin, async(req, res) => {
    try {
        const transaction = await Withdrawal.findOne({ _id: req.params.id });
        transaction.status = "Successful!";
        transaction.confirmed = true;
        await transaction.save();
        req.flash(
            "success_msg",
            "Transaction is confirmed and status set to successful!"
        );
        res.redirect("/dashboard/manage/withdrawals");
    } catch (error) {
        console.log(error);
        req.flash(
            "error_msg",
            "Could not confirm this transaction due to network problems. Try again."
        );
        res.redirect("/dashboard/manage/withdrawals");
    }
});

// verify account
router.post("/user/:id/verify", admin, async(req, res) => {
    try {
        await User.findByIdAndUpdate({ _id: req.params.id }, { is_verified: true });
        req.flash("success_msg", "User account verified successfully!");
        res.redirect("/dashboard/manage/user/" + req.params.id);
    } catch (error) {
        req.flash(
            "error_msg",
            "Something went wrong while verifying account. Please try again."
        );
        res.redirect("/dashboard/manage/user/" + req.params.id);
    }
});

/* fund account */
router.post("/user/:id/fund", admin, async(req, res) => {
    try {
        let { amount, bonus, profit, active_investment } = req.body;

        amount = parseFloat(amount);
        bonus = parseFloat(bonus);
        profit = parseFloat(profit);
        active_investment = parseFloat(active_investment);

        const user = await User.findOne({ _id: req.params.id });

        if (amount) user.balance += amount;
        if (bonus) user.bonus += bonus;
        if (profit) user.profit += profit;
        if (active_investment) user.active_investment += active_investment;

        await user.save();

        req.flash("success_msg", `Funding operation success!`);
        res.redirect("/dashboard/manage/user/" + req.params.id);
    } catch (error) {
        console.log(error.message);
        req.flash("error_msg", "Funding operation failed!");
        return res.redirect("/dashboard/manage/user/" + req.params.id);
    }
});

/* delete a user account */
router.delete("/user/:id/delete", admin, async(req, res) => {
    try {
        User.deleteOne({ _id: req.params.id }, function(err, result) {
            if (err) {
                req.flash(
                    "error_msg",
                    "Unable to delete account due to network problems. Try again."
                );
                return res.redirect(
                    "/dashboard/manage/user/" + req.params.id + "/delete"
                );
            }

            req.flash("success_msg", "Account deleted permanently!");
            res.redirect("/dashboard/manage/users");
        });
    } catch (error) {
        console.log(error);
        res.redirect(serverError);
    }
});

module.exports = router;