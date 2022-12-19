const router = require('express').Router();
const layout = 'errors';

router.get('/error-404', async (req, res) => res.render('errorPages/error-404', { layout }));

router.get("/error-500", async (req, res) =>
  res.render("errorPages/error-500", { layout })
);


module.exports = router;