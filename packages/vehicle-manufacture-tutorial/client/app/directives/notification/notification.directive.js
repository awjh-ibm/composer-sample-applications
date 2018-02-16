angular.module('tutorial')

.directive('tutNotification', [function () {
  return {
    restrict: 'E',
    templateUrl: 'app/directives/notification/notification.html',
    link: function (scope, element, attrs) {

      const allowableVerticle = ['top', 'bottom'];
      const allowableHorizontal = ['left', 'right'];

      scope.notifications = [
        {
          title: 'Hello',
          text: 'Click on the \'Add\' icon to bring up the tutorial and begin the demo.',
          position: {
            vertical: 'top',
            horizontal: 'left'
          },
          animate: 'fade'
        },
        {
          text: 'If at any point you would like to reset the tutorial and start again, click the icon in the top right.',
          position: {
            vertical: 'top',
            horizontal: 'right'
          },
          animate: 'fade'
        }
      ];

      scope.removeNotification = (index) => {
        scope.notifications.splice(index, 1);

        if (!scope.$$phase) {
          scope.$apply();
        }
      };

      scope.addNotification = (title, text, vertical, horizontal) => {
        var notification = {}
        if (title) {
          notification.title = title;
        }
        notification.text = text;

        if (!allowableVerticle.includes(vertical)) {
          throw new Error('Invalid vertical value specified for notification.')
        }

        if (!allowableHorizontal.includes(horizontal)) {
          throw new Error('Invalid horizontal value specified for notification.')
        }
        notification.animate = 'fade';

        notification.position = {};
        notification.position.vertical = vertical;
        notification.position.horizontal = horizontal;

        scope.notifications.forEach((el, index) => {
          el.animate = 'none';

          if (el.position.vertical === notification.position.vertical && el.position.horizontal === notification.position.horizontal) {
            scope.notifications.splice(index, 1);
            notification.animate = 'border';
          }
        })

        scope.notifications.push(notification);

        if (!scope.$$phase) {
          scope.$apply();
        }
      }

      setTimeout(() => {
        scope.addNotification('Test', 'This is a test notification', 'top', 'left');
      }, 2000)

      setTimeout(() => {
        scope.addNotification('Another Test', 'This is a another test notification', 'bottom', 'left');
      }, 4000)
    }
  };
}])
