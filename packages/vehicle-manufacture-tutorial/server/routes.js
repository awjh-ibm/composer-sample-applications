module.exports = function (app) {
  'use strict'

  app.use('/orders', require(__dirname+'/../../vehicle-manufacture-manufacturing/server/api/orders'))
  app.use('/updateOrderStatus', require('../../vehicle-manufacture-manufacturing/server/api/updateOrderStatus'))
  app.use('/transactions', require('../../vehicle-manufacture-vda/server/api/transactions'))
  app.use('/vehicles', require('../../vehicle-manufacture-vda/server/api/vehicles'))
}
