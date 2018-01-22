var request = require('request')
var config = require('config');

let restServerConfig = process.env.REST_SERVER_CONFIG || config.get('restServer');

var composerBaseURL = restServerConfig.httpURL;
var endpoint = composerBaseURL + '/UpdateOrderStatus'

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
          res.send(body)
        })
      }
  });
}

var post = (req, res) => {

  if(!req.body) {
    res.status(400).send('Body must be provided');
  }

  var fullUrl = req.protocol + '://' + req.get('host');
  request.post({
    url: fullUrl+'/user'
  }, (err, response, body) => {
      if (err) {
        res.status(500).send(err.message);
      } else {

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

        if(options.body.order.indexOf('resource:org.base.Order#') === -1) {
          options.body.order = 'resource:org.base.Order#'+options.body.order
        }

        request(options, (err, response, body) => {
            console.log(body);
            if(err) {
              res.status(500).send(err.message);
            } else {
              res.send(body);
            }
        });
      }
  });
}

module.exports = {
  get: get,
  post: post
}
