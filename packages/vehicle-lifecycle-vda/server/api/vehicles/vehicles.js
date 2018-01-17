var request = require('request');
var config = require('config');

let restServerConfig = process.env.REST_SERVER_CONFIG || config.get('restServer');
var composerBaseURL = restServerConfig.httpURL;
var endpoint = composerBaseURL + '/Vehicle'

var get = (req, res) => {
  request.get({
    url: endpoint,
    json: true
  }, (err, response, body) => {
    res.send(body)
  })
}

module.exports = {
  get: get
}
