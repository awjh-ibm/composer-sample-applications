var request = require('request')
var config = require('config');

var get = (req, res) => {

  var restServerConfig = req.app.get('config').restServer;
  var composerBaseURL = restServerConfig.httpURL;
  var endpoint = composerBaseURL + '/UpdateOrderStatus';

  request.get({
    url: endpoint,
    json: true
  }, (err, response, body) => {
    res.send(body)
  })
}

var post = (req, res) => {

  var restServerConfig = req.app.get('config').restServer;
  var composerBaseURL = restServerConfig.httpURL;
  var endpoint = composerBaseURL + '/UpdateOrderStatus';

  if(!req.body) {
    res.status(400).send('Body must be provided');
  }

  var options = {
    method: 'POST',
    url: endpoint,
    qs: {
      access_token: restServerConfig.accessToken
    },
    headers: {
       'Content-Type': 'application/json'
    },
    body: Object.assign({'$class': 'org.base.UpdateOrderStatus'}, req.body),
    json: true
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
