var request = require('request');
var config = require('config');

let restServerConfig = process.env.REST_SERVER_CONFIG || config.get('restServer');
var composerBaseURL = restServerConfig.httpURL;
var endpoint = composerBaseURL + '/wallet/VDA@vehicle-lifecycle-network-14';

var get = (req, res) => {
  request.get({
    url: endpoint+'?access_token='+restServerConfig.accessToken,
    json: true
  }, (err, response, body) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.send(body);
    }
  })
}

var post = (req, res) => {
  var options = {
    method: 'POST',
    url: endpoint+'/setDefault',
    qs: {
      access_token: restServerConfig.accessToken
    },
    headers: {
       'Content-Type': 'application/json'
    }
  };

  request(options, (err, response, body) => {
      if(err) {
        res.status(500).send(err.message);
      } else {
        res.send(body);
      }
  });
}

module.exports = {
  get: get,
  post: post
}
