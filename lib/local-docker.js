
var Docker = require('dockerode');

function localDocker() {

  if (process.env.DOCKER_HOST) {
    var split = /tcp:\/\/([0-9.|localhost]+):([0-9]+)/g.exec(process.env.DOCKER_HOST);
    opts = {
      host: split[1],
      protocol: 'http',
      port: split[2],
      timeout: 5000
    };
  } else {
    opts = {
      socketPath: '/var/run/docker.sock',
      timeout: 1000
    };
  }

  var queryImages = function(dest, cb) {
    var docker = new Docker(opts);
    docker.listImages(cb);
  };

  var queryContainers = function(dest, cb) {
    var docker = new Docker(opts);
    docker.listContainers(cb);
  };

  return {
    queryImages: queryImages,
    queryContainers: queryContainers
  }
}

module.exports = localDocker;
