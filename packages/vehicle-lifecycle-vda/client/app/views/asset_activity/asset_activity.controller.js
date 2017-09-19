angular.module('bc-vda')

.controller('AssetActivityCtrl', ['$scope', '$http', function ($scope, $http) {

  $scope.greeting = ["hello", "world"]

  $scope.chain = [];
  $scope.transactions = [];

  $http.get('transactions').then(function(response, err) {
    if (err) {
      console.log(err);
    } else if (Array.isArray(response.data)) {
      var i = 138;

      $scope.chain = response.data.map(function(transaction) {
        var split = transaction.$class.split('.');
        var type = split[split.length - 1];
        var time = Date.parse(transaction.timestamp);

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
          case "AddUsageEvent": activity="Vehicle Alert"; validator_1="Vehicle"; validator_2=""; sign=""; break;
        }

        if(activity != "")
        {
          $scope.transactions.push({
            timestamp: time,
            transaction_id: transaction.transactionId,
            transaction_type: activity,
            transaction_validator_1: validator_1,
            transaction_validator_2: validator_2,
            transaction_sign: sign
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

      $scope.chain.map(function(transaction) {
        transaction.id = i++;
        return transaction;
      })
    }
  });
}]);

// TO DO MAKE USE OF WEB SOCKETS TO MAKE PAGE LIVE UPDATE
