var request = require('request')
var config = require('config');

let restServerConfig = process.env.REST_SERVER_CONFIG || config.get('restServer');

var composerBaseURL = restServerConfig.httpURL;
var placeOrderEndpoint = composerBaseURL + '/PlaceOrder';
var updateOrderEndpoint = composerBaseURL + '/UpdateOrderStatus'

var get = (req, res) => {
  request.get({
    url: placeOrderEndpoint,
    json: true
  }, (err, response, placedOrders) => {
    if (err) {
      console.log(err.message);
      res.status(500).send(err.message);
      return;
    }
    request.get({
      url: updateOrderEndpoint,
      json: true
    }, (err, response, updates) => {
      if (Array.isArray(placedOrders) && Array.isArray(updates)) {
        placedOrders.forEach((order) => {
            order.statusUpdates = [];
            for (var i = updates.length - 1; i >= 0; i--) {
              var update = updates[i];
              var updatingId;
              if (typeof update.order === 'string') {
                updatingId = update.order.replace('resource:org.base.Order#', '');
              } else if (typeof update.order === 'object') {
                // order has been resolved
                updatingId = update.order.orderId;
              }

              if (updatingId === order.orderId) {
                order.statusUpdates.push(update);
                updates.splice(i, 1);
              }
            }
        });
        res.send(placedOrders)
      } else {
        res.status(500).send('Response from rest server was not in format expected.')
      }
    });
  })
}

module.exports = {
  get: get
}
