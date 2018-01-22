module.exports = function (app) {
  'use strict'

  app.use('/transactions', require('./api/transactions'))
  app.use('/vehicles', require('./api/vehicles'))
  app.use('/user', require('./api/user'))
}
