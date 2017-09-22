import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Http, Response } from '@angular/http';

/**
 * Generated class for the StatusPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-status',
  templateUrl: 'status.html',
})
export class StatusPage {
  car: Object;
  stage: Array<String>;
  relativeDate: any;
  config: any;
  ready: Promise<any>;
  vin: any;
  websocketInsurance: WebSocket;

  constructor(public navCtrl: NavController, public navParams: NavParams, private http: Http) {
    this.car = navParams.get('car');

    console.log(this.car)

    this.stage = [Date.now() + ''];

    this.relativeDate = function(input, start) {
      if (input) {
        input = Date.parse(input);
        start = Date.parse(start);
        var diff = input - start;
        diff = diff / 1000
        diff = Math.round(diff);

        var result = '+' + diff +  ' secs'

        return result;
      }
    };

    let statuses = ['PLACED', 'SCHEDULED_FOR_MANUFACTURE', 'VIN_ASSIGNED', 'OWNER_ASSIGNED', 'DELIVERED'];

    var websocket;

    var openWebSocket = () => {
      var webSocketURL;
      if (this.config.useLocalWS){
        webSocketURL = 'ws://' + location.host + '/ws/updateorderstatus';
      } else {
        webSocketURL = this.config.nodeRedBaseURL+'/ws/updateorderstatus';
      }
      console.log('connecting websocket', webSocketURL);
      websocket = new WebSocket(webSocketURL);

      websocket.onopen = function () {
        console.log('updateorderstatus websocket open!');
      };

      websocket.onclose = function() {
        console.log('closed');
        openWebSocket();
      }

      this.vin = 123456127;

      websocket.onmessage = (event) => {
        if (event.data === '__pong__') {
          return;
        }

        var status = JSON.parse(event.data);
        console.log(status);
        if (status.orderStatus === statuses[0]) {
          this.stage[0] = status.timestamp;
        } else {
          let i = statuses.indexOf(status.orderStatus);
          if(status.orderStatus === statuses[2])
          {
            this.vin = status.order.vehicleDetails.vin;
          }
          this.stage[i] = this.relativeDate(status.timestamp, this.stage[0]);
        }
      };
    }
    
    var openInsuranceWebSocket = () => {
      var webSocketInsuranceURL;
      if (this.config.useLocalWS){
        webSocketInsuranceURL = 'ws://' + location.host + '/ws/requestpolicy';
      } else {
        webSocketInsuranceURL = this.config.nodeRedBaseURL+'/ws/requestpolicy';
      }
      console.log('connecting websocket', webSocketInsuranceURL);
      this.websocketInsurance = new WebSocket(webSocketInsuranceURL);

      this.websocketInsurance.onopen = function () {
        console.log('insurance websocket open!');
      };

      this.websocketInsurance.onclose = function() {
        console.log('closed');
        openInsuranceWebSocket();
      }

      this.websocketInsurance.onmessage = (event) => {
        console.log("MESSAGE RECIEVED")
      };
    }

    this.ready = this.loadConfig()
      .then((config) => {
        this.config = config;
        openWebSocket();
        openInsuranceWebSocket();
      });
  }

  insure() {
    
    document.getElementById('insureBtn').getElementsByTagName('span')[0].innerHTML = "Processing ..."
    navigator.geolocation.getCurrentPosition(success, error)

    this.stage[5] = "Insured";

    var parent = this;
    function success(position)
    {
      document.getElementById('insureBtn').getElementsByTagName('span')[0].innerHTML = "Request Sent &#10004;"
      console.log(position)
      var full_car = {};
      Object.keys(parent.car).forEach((key) => full_car[key] = parent.car[key]);
      full_car["vin"] = parent.vin;
  
      var order = {
        vehicleDetails: full_car,
        requestee: "resource:org.acme.vehicle.lifecycle.PrivateOwner#dan",
        policyType: "Fully Comprehensive",
        manufacturing_date: new Date(),
        location:
          {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
      };
  
      parent.ready.then(() => {
        parent.websocketInsurance.send(JSON.stringify(order));
      });
    }

    function error(error)
    {
      parent.stage.splice(5,1)
      document.getElementById('insureBtn').getElementsByTagName('span')[0].innerHTML = "Processing ..."
      alert("Unable to get location, Please try again.")
    }
  }

  loadConfig(): Promise<any> {
      // Load the config data.
      return this.http.get('/assets/config.json')
      .map((res: Response) => res.json())
      .toPromise();
  }
}
