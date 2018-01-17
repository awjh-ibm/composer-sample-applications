angular.module('bc-vda')

.directive('bcVdaHeader', ['$location', '$http', function (location, $http) {
  return {
    restrict: 'E',
    templateUrl: 'app/directives/header/header.html',
    link: function (scope) {
      scope.registered_vehicles = 0;
      scope.vin_assigned = 0;
      scope.v5c_issued = 0;

      $http.get('/vehicles').then(function(response) {

        if (response && response.data) {
          for (var i = 0; i < response.data.length; ++i) {
            var vehicle = response.data[i];

            scope.registered_vehicles++;
            scope.vin_assigned++; // all registered vehicles have a vin;

            if (vehicle.owner) {
              scope.v5c_issued++;
            }
          }
        }
      });

      scope.isActive = function(route) {
        return route === location.path();
      }

      let destroyed = false;
      let websocket;

      function openWebSocket() {
        var webSocketURL = 'ws://' + location.host() + ':' + location.port();
        websocket = new WebSocket(webSocketURL);

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
          if (message.$class = 'org.base.UpdateOrderStatusEvent') {
            if (message.orderStatus === 'VIN_ASSIGNED') {
              scope.registered_vehicles++;
              scope.vin_assigned++;
            } else if (message.orderStatus === 'OWNER_ASSIGNED') {
              scope.v5c_issued++;
            }
          }
        }
      }
      openWebSocket();

      scope.$on('$destroy', function() {
        destroyed = true;
        if (websocket) {
          websocket.close();
        }
      })
    }
  };
}])
