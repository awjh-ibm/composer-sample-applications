var request = require('request')
var config = require('config');

let restServerConfig = process.env.REST_SERVER_CONFIG || config.get('restServer');

var composerBaseURL = restServerConfig.httpURL;
var endpoint = composerBaseURL + '/UpdateOrderStatus'

var get = (req, res) => {
  console.log('What is endpoint',endpoint);
  request.get({
    url: endpoint,
    json: true
  }, (err, response, body) => {
    res.send(body)
  })
}

var post = (req, res) => {

  if(!req.body) {
    res.status(400).send('Body must be provided');
  }

  var options = {
    method: 'POST',
    url: endpoint,
    qs: {
      access_token: 'xzd5HAhOHqBP8MFS4zyoHO1HGcNolpcj335cG6iChjjJ1k3swkQUnrgHZmTpAssD'
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
