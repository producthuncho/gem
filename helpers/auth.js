module.exports = {
  auth: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("error_msg", "Please login to your account to access that page!");
    res.redirect("/login");
  },

  control: function (req, res, next) {
    if (req.user.control === true) {
      return next();
    }
    res.redirect('/error/error-404');
  }
};
