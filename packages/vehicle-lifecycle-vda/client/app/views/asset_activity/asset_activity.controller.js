angular.module('bc-vda')

.controller('AssetActivityCtrl', ['$scope', '$http', function ($scope, $http) {

  $scope.greeting = ["hello", "world"]

  $scope.chain = [];
  $scope.transactions = [];

  $scope.newrow = "";

  $http.get('transactions').then(function(response, err) {
    if (err) {
      console.log(err);
    } else if (Array.isArray(response.data)) {
      var i = 138;

      $scope.chain = response.data.map(function(transaction) {
        var split = transaction.$class.split('.');
        var type = split[split.length - 1];
        var time = Date.parse(transaction.timestamp);

        var extraText = "";

        var details = get_activity_from_type(type);

        if(details.activity == "Alert")
        {
          extraText = "Vehicle "+transaction.usageEvent.eventType.split('_').join(' ').toLowerCase()+" "
        }

        if(details.activity != "")
        {
          $scope.transactions.push({
            timestamp: time,
            transaction_id: transaction.transactionId,
            transaction_type: extraText+ "" +details.activity,
            transaction_validator_1: details.validator_1,
            transaction_validator_2: details.validator_2,
            transaction_sign: details.sign,
            transaction_class: "existing-row"
          });
  
          return {
            transID: transaction.transactionId,
            type: type,
            status: transaction.orderStatus,
            time: time
          };
        }
      });

      $scope.chain.sort(function(t1, t2) {
        return t1.time - t2.time;
      })

    }
  });

  var placeOrder;
  var updateOrder;
  var createPolicy;
  var createUsageRecord;
  var addUsageEvent;
  var destroyed = false;

  function openPlaceOrderWebSocket() {
    placeOrder = new WebSocket('ws://' + location.host + '/ws/placeorder');

    placeOrder.onopen = function() {
      console.log('placeOrder websocket open!');
      // Notification('PlaceOrder WebSocket connected');
    };

    placeOrder.onclose = function() {
      console.log('closed');
      // Notification('PlaceOrder WebSocket disconnected');
      if (!destroyed) {
        openPlaceOrderWebSocket();
      }
    }

    placeOrder.onmessage = function(event) {
      if (event.data === '__pong__') {
        return;
      }

      var order = JSON.parse(event.data);
      $scope.addBlock(order.transactionId, 'PlaceOrder');
      $scope.$apply();
    }
  }

  function openUpdateOrderWebSocket() {
    updateOrder = new WebSocket('ws://' + location.host + '/ws/updateorderstatus');

    updateOrder.onopen = function() {
      console.log('updateOrder websocket open!');
      // Notification('UpdateOrderStatus WebSocket connected');
    };

    updateOrder.onclose = function() {
      console.log('closed');
      // Notification('UpdateOrderStatus WebSocket disconnected');
      if (!destroyed) {
        openUpdateOrderWebSocket();
      }
    }

    updateOrder.onmessage = function(event) {
      if (event.data === '__pong__') {
        return;
      }
      var status = JSON.parse(event.data);
      $scope.addBlock(status.transactionId, 'UpdateOrderStatus');
      $scope.$apply();
    }
  }

  function openPolicyWebSocket() {
    createPolicy = new WebSocket('ws://' + location.host + '/ws/createpolicy');

    createPolicy.onopen = function() {
      console.log('createPolicy websocket open!');
      // Notification('PlaceOrder WebSocket connected');
    };

    createPolicy.onclose = function() {
      console.log('closed');
      // Notification('PlaceOrder WebSocket disconnected');
      if (!destroyed) {
        openPolicyWebSocket();
      }
    }

    createPolicy.onmessage = function(event) {

      var order = JSON.parse(event.data);
      $scope.addBlock(order.eventId.split('#')[0], 'CreatePolicy');
      $scope.$apply();
    }
  }
  
  function openCreateUsageWebSocket() {
    createUsageRecord = new WebSocket('ws://' + location.host + '/ws/createusagerecord');

    createUsageRecord.onopen = function() {
      console.log('CreateUsageRecord websocket open!');
      // Notification('PlaceOrder WebSocket connected');
    };

    createUsageRecord.onclose = function() {
      console.log('closed');
      // Notification('PlaceOrder WebSocket disconnected');
      if (!destroyed) {
        openCreateUsageWebSocket();
      }
    }

    createUsageRecord.onmessage = function(event) {

      var order = JSON.parse(event.data);
      $scope.addBlock(order.eventId.split('#')[0], 'CreateUsageRecord');
      $scope.$apply();
    }
  }

  function openAddUsageEventWebSocket() {
    addUsageEvent = new WebSocket('ws://' + location.host + '/ws/addusageevent');

    addUsageEvent.onopen = function() {
      console.log('addusageevent websocket open!');
      // Notification('PlaceOrder WebSocket connected');
    };

    addUsageEvent.onclose = function() {
      console.log('closed');
      // Notification('PlaceOrder WebSocket disconnected');
      if (!destroyed) {
        openCreateUsageWebSocket();
      }
    }

    addUsageEvent.onmessage = function(event) {

      var order = JSON.parse(event.data);
      $scope.addBlock(order.eventId.split('#')[0], 'AddUsageEvent', "Vehicle "+order.usageEvent.eventType.split('_').join(' ').toLowerCase()+" ");
      $scope.$apply();
    }
  }

  openPlaceOrderWebSocket();
  openUpdateOrderWebSocket();
  openPolicyWebSocket();
  openCreateUsageWebSocket();
  openAddUsageEventWebSocket();

  $scope.addBlock = function (transactionId, type, usageEvent) {
    
    var details = get_activity_from_type(type)

    if(details.activity != "")
    {
      $scope.transactions.push({
        timestamp: new Date(),
        transaction_id: transactionId,
        transaction_type: usageEvent + "" + details.activity,
        transaction_validator_1: details.validator_1,
        transaction_validator_2: details.validator_2,
        transaction_sign: details.sign,
        transaction_class: "new-row"
      });
    }
  };

  function get_activity_from_type(type)
  {
    var activity = "";
    var validator_1 = "";
    var validator_2 = "";
    var sign = "+";

    switch(type)
    {
      case "CreatePolicy": activity = "New Insurance Issued"; validator_1 = "Insurer"; validator_2 = "Vehicle Owner"; break;
      case "PlaceOrder": activity = "New Vehicle Request"; validator_1="Vehicle Owner"; validator_2 = "Manufacturer"; break;
      case "UpdateOrderStatus": activity = "Vehicle Manufacture"; validator_1="Manufacturer"; validator_2 = "Vehicle"; break;
      case "PrivateVehicleTransfer": activity = "Vehicle Transfer"; validator_1="Vehicle Owner"; validator_2 = "Vehicle Owner"; break;
      case "AddUsageEvent": activity="Alert"; validator_1="Vehicle"; validator_2=""; sign=""; break;
    }

    return {"activity": activity, "validator_1": validator_1, "validator_2": validator_2, "sign": sign}
  }

}]);

// TO DO MAKE USE OF WEB SOCKETS TO MAKE PAGE LIVE UPDATE
