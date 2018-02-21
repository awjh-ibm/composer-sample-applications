# Introduction
## Welcome
Welcome to the vehicle manufacturing sample application. This was built using IBM Blockchain Platform: Develop.

## What can I do in this web application?
You will be able to take on the roles of vehicle buyer, manufacturer and regulator in order to understand how they can communicate using a Blockchain.

[//]: # ('NOTIFICATION | Hello! | Click on the 'Add' icon to bring up the tutorial and begin the demo. | TOP | LEFT | CREATE_WHEN => [] | DESTROY_WHEN => [ LISTENER | EVENT | | #expandContract |  click ]')
[//]: # ('NOTIFICATION |  | If at any point you would like to reset the tutorial and start again, click the icon in the top right. | TOP | RIGHT | CREATE_WHEN => [] | DESTROY_WHEN => [ LISTENER | EVENT | | #reset |  click ]')
[//]: # ('BUTTON | Start Tutorial | /car-builder | ENABLEMENT_RULE => []')

# Building your car
## Start the process
Click 'BUILD YOUR CAR'

[//]: # ('LISTENER | EVENT | carBuilder | #buildCar | click')

## Select your type of car
Select a car to build by swiping left and right then click 'BUILD'

[//]: # ('LISTENER | EVENT | carBuilder | .slideEl | click')

## Select the options for the car
Use the slide down fields to select your trim, colour, interior and optional extras

[//]: # ('LISTENER | ATTRIBUTE | carBuilder | #purchase | disabled')

## Purchase your car
Press 'PURCHASE AND BUILD'

[//]: # ('LISTENER | EVENT | carBuilder | #purchase | click')

[//]: # ('NOTIFICATION | Well done! | You managed to request a new car. | TOP | LEFT | CREATE_WHEN => [ REST_EVENT | $class | EQUAL | org.base.PlaceOrderEvent ] | DESTROY_WHEN => [ LISTENER | EVENT | | #expandContract |  click ]')

[//]: # ('BUTTON | See manufacturer's view | /manufacturer-dashboard | ENABLEMENT_RULE => [ REST_EVENT | $class | EQUAL | org.base.PlaceOrderEvent]')

# Manufacturing the car
## Manufacture the vehicle
Click 'START MANUFACTURE'

[//]: # ('LISTENER | EVENT | manufacturer | .start-manufacture | click')

[//]: # ('BUTTON | See regulator's view | /regulator-dashboard | ENABLEMENT_RULE => [ REST_EVENT | $class | EQUAL | org.base.UpdateOrderStatusEvent | AND => [ REST_EVENT | orderStatus | EQUAL | DELIVERED ]]')