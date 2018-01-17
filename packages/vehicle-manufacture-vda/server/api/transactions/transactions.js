var request = require('request');
var config = require('config');

var get = (req, res) => {

  var restServerConfig = req.app.get('config').restServer;
  var composerBaseURL = restServerConfig.httpURL;
  var endpoint = composerBaseURL + '/system/historian'

  request.get({
    url: endpoint,
    json: true
  }, (err, response, body) => {
    console.log(endpoint);
    res.send(body)
  })
}

module.exports = {
  get: get
}
