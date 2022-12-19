module.exports = function (app) {
    app.use('/dashboard/manage', require('../routes/dashboard/manager'));
    app.use('/dashboard', require('../routes/dashboard/index'));
    app.use('/auth', require('../routes/auth'));
    app.use('/error', require('../routes/errors'));
    app.use('/', require('../routes/site'));
}