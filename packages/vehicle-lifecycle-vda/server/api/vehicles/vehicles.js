var request = require('request');
var config = require('config');

let restServerConfig = process.env.REST_SERVER_CONFIG || config.get('restServer');
var composerBaseURL = restServerConfig.httpURL;
var endpoint = composerBaseURL + '/Vehicle'

var get = (req, res) => {
  var fullUrl = req.protocol + '://' + req.get('host');
  request.post({
    url: fullUrl+'/user'
  }, (err, response, body) => {
      if (err) {
        res.status(500).send(err.message);
      } else {
        request.get({
          url: endpoint+'?access_token='+restServerConfig.accessToken,
          json: true
        }, (err, response, body) => {
          if (err) {
            res.status(500).send(err.message);
          } else {
            res.send(body)
          }
        })
      }
  })
}

module.exports = {
  get: get
}
