const exphbs = require('express-handlebars');
const Handlebars = require('handlebars');
// Import function exported by newly installed node modules.
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');

module.exports = function(app) {
    app.engine('handlebars', exphbs.engine({
        defaultLayout: 'main',
        // ...implement newly added insecure prototype access
        handlebars: allowInsecurePrototypeAccess(Handlebars)
    }));
    app.set('view engine', 'handlebars');
}