angular.module('bc-manufacturer')

.controller('DashboardCtrl', ['$scope', '$http', '$interval', function ($scope, $http, $interval) {
  $scope.statuses = ['PLACED', 'SCHEDULED_FOR_MANUFACTURE', 'VIN_ASSIGNED', 'OWNER_ASSIGNED', 'DELIVERED'];

  $http.get('orders').then(function(response, err) {
    if (err) {
      console.log(err);
    } else if (response.data.error) {
      console.log(response.data.error.message);
    } else {
      if (Array.isArray(response.data)) {
        $scope.orders = response.data.map(function(o) {
          var order = {
            car: {
              id: o.orderId,
              name: o.vehicleDetails.modelType,
              serial: 'S/N ' + generateSN(),
              colour: o.vehicleDetails.colour
            },
            placed: Date.parse(o.timestamp)
          };

          if (o.statusUpdates) {
            o.statusUpdates.sort(function (a,b) {
              if (Date.parse(a.timestamp) < Date.parse(b.timestamp))
                return -1;
              if (Date.parse(a.timestamp) > Date.parse(b.timestamp))
                return 1;
              return 0;
            })
            order.status = o.statusUpdates[o.statusUpdates.length-1].orderStatus;
            for (var i = 0; i < o.statusUpdates.length; ++i) {
              var update = o.statusUpdates[i];
              var timestamp = Date.parse(update.timestamp);
              if (update.orderStatus === $scope.statuses[1]) {
                order.manufacture = order.manufacture ? order.manufacture : {};
                order.manufacture.chassis = timestamp;
                order.manufacture.interior = timestamp;
                order.manufacture.paint = timestamp;
              } else if (update.orderStatus === $scope.statuses[2]) {
                order.manufacture = order.manufacture ? order.manufacture : {};
                order.manufacture.vinIssue = timestamp;
              } else if (update.orderStatus === $scope.statuses[3]) {
                order.manufacture = order.manufacture ? order.manufacture : {};
                order.manufacture.vinPrinting = timestamp;
              } else if (update.orderStatus === $scope.statuses[4]) {
                order.delivery = {
                  shipping: timestamp
                };
              }
            }
          }

          return order;
        });
      }
    }
  })

  // Websockets

  var placeOrder;
  var updateOrder;
  var destroyed = false;

  function openWebSocket() {
    var webSocketURL = 'ws://' + location.host;
    let websocket = new WebSocket(webSocketURL);
    websocket.onopen = function () {
      console.log('Websocket is open');
    }

    websocket.onclose = function () {
      console.log('Websocket closed');
      if (!destroyed) {
        openWebSocket();
      }
    }

    websocket.onmessage = function (event) {
      var message = JSON.parse(event.data);
      if(message.$class === 'org.acme.vehicle_network.PlaceOrderEvent') {
        handlePlaceOrderEvent(message);
      } else if (message.$class === 'org.acme.vehicle_network.UpdateOrderStatusEvent') {
        handleUpdateOrderEvent(message);
      }
    }
  }

  function handlePlaceOrderEvent(newOrder) {
    $scope.orders.push({
      car: {
        id: newOrder.orderId,
        name: newOrder.vehicleDetails.modelType,
        serial: 'S/N ' + generateSN(),
        colour: newOrder.vehicleDetails.colour
      },
      status: $scope.statuses[0],
      placed: Date.now()
    })
    $scope.$apply();
  }

  function handleUpdateOrderEvent(orderEvent) {
    for (var i = 0; i < $scope.orders.length; ++i) {
      var o = $scope.orders[i];
      if (o.car.id === orderEvent.order.orderId) {
        o.status = orderEvent.orderStatus;
        var timestamp = Date.parse(orderEvent.timestamp);
        if (orderEvent.orderStatus === $scope.statuses[1]) {
          o.manufacture = {
            chassis: timestamp,
            interior: timestamp,
            paint: timestamp
          };
        } else if (orderEvent.orderStatus === $scope.statuses[2]) {
          o.manufacture.vinIssue = timestamp;
        } else if (orderEvent.orderStatus === $scope.statuses[3]) {
          o.manufacture.vinPrinting = timestamp;
        } else if (orderEvent.orderStatus === $scope.statuses[4]) {
          o.delivery = {
            shipping: timestamp
          };
        }
      }
    }
    $scope.$apply();
  }

  openWebSocket();

  var generateVIN = function() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    function s1() {
      return Math.floor(Math.random() * 10);
    }
    return s4() + s4() + s4() + s4() + s1();
  }

  var generateSN = function() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    function s1() {
      return Math.floor(Math.random() * 10);
    }
    return s4() + s4() + s1() + s1() + s1();
  }

  var updateOrderStatus = function(status, count) {
    if (count === 2) {
      status.vin = generateVIN();
    }
    status.orderStatus = $scope.statuses[count];

    $http.post('updateOrderStatus', status).then(function(response, err) {
      if(err) {
        console.log(err.message);
      }
    });

  }

  $scope.start = function(order) {
    var delay = 5000;
    var count = 1;

    var status = {
      vin: '',
      order: order.car.id
    };

    order.manufacture = {};

    $interval(function() {
      updateOrderStatus(status, count)
      count++;
    }, delay, $scope.statuses.length - 1);

  }

  $scope.$on('$destroy', function () {
    destroyed = true;
  });
}])

.filter('relativeDate', function() {
  return function(input, start) {
    if (input) {
      var diff = input - start;
      diff = diff / 1000
      diff = Math.round(diff);

      var result = '+' + diff +  ' secs'

      return result;
    }
  };
})
