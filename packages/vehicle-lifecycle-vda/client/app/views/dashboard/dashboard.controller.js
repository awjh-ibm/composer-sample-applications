angular.module('bc-vda')

.controller('DashboardCtrl', ['$scope', '$http', function ($scope, $http) {

  $scope.chain = [];
  $scope.transactions = [];

  $http.get('transactions')
  .then(function(response, err) {
    if (err) {
      console.log(err);
    } else if (Array.isArray(response.data)) {
      var i = 138;

      $scope.chain = response.data.map(function(transaction) {
        var split = transaction.transactionType.split('.');
        var type = split[split.length - 1];
        var time = Date.parse(transaction.transactionTimestamp);

        let transactionSubmitter;
        let displayTransaction = false;
        let orderStatus = '';
        switch(type) {
          case 'SetupDemo':         transactionSubmitter = 'Admin';
                                    displayTransaction = true;
                                    break;

          case 'PlaceOrder':        transactionSubmitter = transaction.participantInvoking.replace('resource:org.base.PrivateOwner#', '');
                                    displayTransaction = true;
                                    break;

          case 'UpdateOrderStatus': transactionSubmitter = transaction.participantInvoking.replace('resource:org.base.Manufacturer#', '');
                                    displayTransaction = true;
                                    orderStatus = transaction.eventsEmitted[0].orderStatus;
                                    break;
        }

        if (displayTransaction) {
          $scope.transactions.push({
            timestamp: time,
            transaction_id: transaction.transactionId,
            transaction_type: type,
            transaction_submitter: transactionSubmitter
          });
        }

        return {
          transID: transaction.transactionId,
          type: type,
          status: orderStatus,
          time: time,
          display_transaction: displayTransaction
        };
      });

      $scope.chain = $scope.chain.filter(el => el.display_transaction);

      $scope.chain.sort(function(t1, t2) {
        return t1.time - t2.time;
      })

      $scope.chain.map(function(transaction) {
        transaction.id = i++;
        return transaction;
      })
    }
  });

  // Websockets
  var destroyed = false;
  let websocket;
  function openWebSocket() {
    var webSocketURL = 'ws://' + location.host;
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
      var caller = message.orderer ? message.orderer.replace('resource:org.base.PrivateOwner#', '') : message.order.manufacturer.replace('resource:org.base.Manufacturer#', '');
      var status = message.order ? message.orderStatus : null;
      $scope.addBlock(message.eventId.split('#')[0], message.$class.replace('org.base.', '').replace('Event', ''), caller, status);
      $scope.$apply();
    }
  }

  openWebSocket();

  $scope.addBlock = function (tranactionId, type, submitter, status) {
    var id = $scope.chain[$scope.chain.length - 1].id + 1;
    $scope.chain.push({
      id: id,
      transID: tranactionId,
      type: type,
      status: status
    });
    $scope.transactions.push({
      timestamp: Date.now(),
      transaction_id: tranactionId,
      transaction_type: type,
      transaction_submitter: submitter
    });
  };

  $scope.$on('$destroy', function () {
    destroyed = true;
    if (websocket) {
      websocket.close();
    }
  });
}]);
