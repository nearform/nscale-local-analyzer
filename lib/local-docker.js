
var Docker = require('dockerode');
var fs = require('fs');
var path = require('path');

var instantiateDocker = function() {
  var split;
  var opts = {}

  if (process.env.DOCKER_HOST) {
    split = /tcp:\/\/([0-9.]+):([0-9]+)/g.exec(process.env.DOCKER_HOST);

    if (process.env.DOCKER_TLS_VERIFY === '1') {
      opts.protocol = 'https';
    }
    else {
      opts.protocol = 'http';
    }

    opts.host = split[1];

    if (process.env.DOCKER_CERT_PATH) {
      opts.ca = fs.readFileSync(path.join(process.env.DOCKER_CERT_PATH, 'ca.pem'));
      opts.cert = fs.readFileSync(path.join(process.env.DOCKER_CERT_PATH, 'cert.pem'));
      opts.key = fs.readFileSync(path.join(process.env.DOCKER_CERT_PATH, 'key.pem'));
    }

    opts.port = split[2];
  }
  else {
    opts.socketPath = '/var/run/docker.sock';
  }

  return new Docker(opts);
};

function localDocker() {

  var queryImages = function(dest, cb) {
    var docker = instantiateDocker();
    docker.listImages(cb);
  };

  var queryContainers = function(dest, cb) {
    var docker = instantiateDocker();
    docker.listContainers(cb);
  };

  return {
    queryImages: queryImages,
    queryContainers: queryContainers
  }
}

module.exports = localDocker;
