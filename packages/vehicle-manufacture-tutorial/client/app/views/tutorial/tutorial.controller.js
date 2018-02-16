angular.module('tutorial')

.controller('TutorialCtrl', ['$scope', '$http', '$interval', function ($scope, $http, $interval) {
    var destroyed = false;
    $scope.location = '/car-builder';    
    $scope.ready = false;
    document.getElementById('carBuilder').addEventListener('load', function (){
        document.getElementById('carBuilder').removeEventListener('load', arguments.callee);
        $scope.ready = true;
        if(!$scope.$$phase) {
            $scope.$apply();
        }
        $scope.tutorial[0].steps[0].listener();
    });
    $scope.tutorialPage = 0;
    $scope.tutorial = [{
        steps: [{
            text: 'Click \'BUILD YOUR CAR\'',
            listener: () => {
                addiFrameEventListener('carBuilder', '#buildCar', 'click', 0, 0);
            },
            complete: false
        },
        {
            text: 'Select a car to build by swiping left and right then click \'BUILD\'',
            listener: () => {
                addiFrameEventListener('carBuilder', '.slideEl', 'click', 0, 1);
                addiFrameEventListener('carBuilder', '.slideEl', 'click', 0, 1);
                addiFrameEventListener('carBuilder', '.slideEl', 'click', 0, 1);
            },
            complete: false
        },
        {
            text: 'Select your trim, colour, interior and optional extras',
            listener: () => {
                addiFrameAttributeListener('carBuilder', 'purchase', 'disabled', 0, 2);
            },
            complete: false
        },
        {
            text: 'Press \'PURCHASE AND BUILD\'',
            listener: () => {
                addiFrameEventListener('carBuilder', '#purchase', 'click', 0, 3);
            },
            complete: false
        }],
        button: {
            text: 'See manufacturer\'s view',
            action: () => {
                changePage('/manufacturer-dashboard', true);
            },
            enablementRule: {
                key: '$class',
                value: 'org.base.PlaceOrderEvent',
                comparison: 'EQUAL',
                combineWith: null
            },
            disabled: true
        }
    },
    {
        steps: [{
            text: 'Click \'START MANUFACTURE\'',
            listener: () => {
                addiFrameEventListener('manufacturer', '.start-manufacture', 'click', 1, 0);
            },
            complete: false
        }],
        button: {
            text: 'See regulator\'s view',
            action: () => {
                changePage('/regulator-dashboard', true);
            },
            enablementRule: {
                key: '$class',
                value: 'org.base.UpdateOrderStatusEvent',
                comparison: "EQUAL",
                combineWith: {
                    connection: 'AND',
                    rule: {
                        key: 'orderStatus',
                        value: 'DELIVERED',
                        comparison: "EQUAL"
                    }
                }
            },
            disabled: true
        }
    }];

    function openWebSocket() {
        var webSocketURL = 'ws://' + location.host;
        let websocket = new WebSocket(webSocketURL);
        websocket.onopen = function () {
            console.log('Tutorial websocket is open');
        }
    
        websocket.onclose = function () {
            console.log('Tutorial websocket closed');
            if (!destroyed) {
                openWebSocket();
            }
        }
    
        websocket.onmessage = function (event) {
            var message = JSON.parse(event.data);
            var button = $scope.tutorial[$scope.tutorialPage].button;
            if (calculateBoolean(button.enablementRule, message)) {
                button.disabled = false;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            }
        }
    }
    openWebSocket();

    function changePage(newLocation, forward) {
        if (newLocation) {
            $scope.location = newLocation;
        }

        if (forward && $scope.tutorialPage < $scope.tutorial.length-1) {
            $scope.tutorialPage += 1;
        } else if (!forward && $scope.tutorialPage > 0) {
            $scope.tutorialPage -= 1;
        }

        if ($scope.tutorialPage < $scope.tutorial.length) {
            $scope.tutorial[$scope.tutorialPage].steps[0].listener();
        }

        if (!$scope.$$phase) {
            $scope.$apply(); 
        }
    }

    function addiFrameEventListener(frameId, listenElement, listenType, pageNumber, stepNumber) {
        var listenTo;
        if (listenElement.startsWith('#')) {
            listenTo = [getiFrame(frameId).getElementById(listenElement.substr(1))];

        } else if (listenElement.startsWith('.')) {
            listenTo = getiFrame(frameId).getElementsByClassName(listenElement.substr(1));
            console.log(listenTo);
        } else {
            throw new Error('Element to listen against should start with # for ID or . for class.')
        }

        var listenAction = () => {
            $scope.tutorial[pageNumber].steps[stepNumber].complete = true;
            if (!$scope.$$phase) {
                $scope.$apply();
            }
            if (stepNumber < $scope.tutorial[pageNumber].steps.length-1) {
                $scope.tutorial[pageNumber].steps[stepNumber+1].listener();
            }
            for(var i = 0; i < listenTo.length; i++) {
                listenTo[i].removeEventListener(listenType, listenAction);
            }
        };

        for(var i = 0; i < listenTo.length; i++) {
            listenTo[i].addEventListener(listenType, listenAction);
        }
    }

    function addiFrameAttributeListener(frameId, listenElement, attributeToListen, pageNumber, stepNumber) {
        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
        var observer = new MutationObserver(function(mutations, observer) {
            mutations.forEach(function(mutation) {
              if (mutation.type == 'attributes') {
                if (mutation.attributeName === attributeToListen) {
                    $scope.tutorial[pageNumber].steps[stepNumber].complete = true;
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                    if (stepNumber < $scope.tutorial[pageNumber].steps.length-1) {
                        $scope.tutorial[pageNumber].steps[stepNumber+1].listener();
                    }
                    observer.disconnect();
                }
              }
            });
        });
        observer.observe(getiFrame(frameId).getElementById(listenElement), {
            attributes: true //configure it to listen to attribute changes
        });
    }

    $scope.$on('$destroy', function () {
        destroyed = true;
    });

}]);

function getiFrame(frameId) {
    let iframe = document.getElementById(frameId);
    return (iframe.contentDocument) ? iframe.contentDocument : iframe.contentWindow.document;
};

function calculateBoolean(rule, object) {
    
    var leftHand;

    switch(rule.comparison) {
        case 'EQUAL': leftHand = (object[rule.key] === rule.value); break;
        case 'NOT EQUAL': leftHand = (object[rule.key] !== rule.value); break;
        case 'GREATER THAN': leftHand = (object[rule.key] > rule.value); break;
        case 'GREATER THAN OR EQUAL': leftHand = (object[rule.key] >= rule.value); break;
        case 'LESS THAN': leftHand = (object[rule.key] > rule.value); break;
        case 'LESS THAN OR EQUAL': leftHand = (object[rule.key] >= rule.value); break;
        default: throw new Error('Comparison value invalid', rule.comparison);
    }

    if (rule.combineWith) {
        switch(rule.combineWith.connection) {
            case 'AND': return leftHand && calculateBoolean(rule.combineWith.rule, object);
            case 'OR': return leftHand || calculateBoolean(rule.combineWith.rule, object);
            default: throw new Error('Connection value invalid', rule.combineWith.connection)
        }
    }

    return leftHand;
}
