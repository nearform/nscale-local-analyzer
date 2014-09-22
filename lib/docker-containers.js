/*
 * THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

var async = require('async');
var _ = require('lodash');
var Docker = require('dockerode');

/**
 * Creates a Docker instance for accessing the local docker, like the docker CLI
 */
function resolveDocker() {
  var opts;

  if (process.env.DOCKER_HOST) {
    var split = /tcp:\/\/([0-9.|localhost]+):([0-9]+)/g.exec(process.env.DOCKER_HOST);
    opts = {
      host: split[1],
      protocol: 'http',
      port: split[2]
    };
  } else {
    opts = {
      socketPath: '/var/run/docker.sock'
    };
  }

  return new Docker(opts);
};

var docker = resolveDocker();



/*
 * assumes that the container names take the form
 * searches on container regex and returns the latest based on docker timestamp
 * and latest running
 * 
 * finds the greatest build number 
 * if build number is absent finds the latest by time
 */
var queryImages = function(cb) {
  docker.listImages(cb);
};



var queryContainers = function(cb) {
  docker.listContainers(cb);
};



var matchImageToContainer = function(container, results) {
  return _.find(results.containerDefinitions, function(cdef) {
    return cdef.specific.imageTag === container.Image;
  });
};



exports.fetchContainers = function fetchContainers(options, result, done) {
  var topologyContainers = result.topology.containers;
  var newTopology = {};

  async.eachSeries(_.values(topologyContainers), function(instance, cb) {
    queryContainers(function(err, containers) {
      _.each(containers, function(container) {

        if (options.dockerFilters) {
          _.each(options.dockerFilters, function(filter) {
            if (container.Image.indexOf(filter) !== -1) {
              var cdef = matchImageToContainer(container, result);
              if (cdef) {
                instance.contains.push(container.Id);
                newTopology[container.Id] = {id: container.Id,
                                             containerDefinitionId: cdef.id,
                                             containedBy:  instance.id,
                                             contains: [],
                                             specific: {dockerImageId: cdef.specific.dockerImageId,
                                                        dockerContainerId: container.Id,
                                                        containerBinary: '',
                                                        dockerLocalTag: '',
                                                        buildNumber: 0,
                                                        version: ''}};
              }
            }
          });
        }
        else {
          var cdef = matchImageToContainer(container, result);
          if (cdef) {
            instance.contains.push(container.Id);
            newTopology[container.Id] = {id: container.Id,
                                         containerDefinitionId: cdef.id,
                                         containedBy:  instance.id,
                                         contains: [],
                                         specific: {dockerImageId: cdef.specific.dockerImageId,
                                                    dockerContainerId: container.Id,
                                                    containerBinary: '',
                                                    dockerLocalTag: '',
                                                    buildNumber: 0,
                                                    version: ''}};
          }
        }
      });
      cb();
    });
  }, function() {
    _.merge(result.topology.containers, newTopology);
    done();
  });
};



/**
 * check this - important not to duplicate images in the container definitions section...
 */
exports.fetchImages = function fetchImages(options, result, done) {
  var topologyContainers    = result.topology.containers;
  var containerDefinitions  = result.containerDefinitions;

  async.eachSeries(_.values(topologyContainers), function(instance, cb) {
    queryImages(function(err, images) {
      _.each(images, function(image) {
        if (options.dockerFilters) {
          _.each(options.dockerFilters, function(filter) {
            if (image.RepoTags[0].indexOf(filter) !== -1) {
              containerDefinitions.push({id: image.Id,
                                         name: filter,
                                         type: 'docker',
                                         specific: {repositoryUrl: '',
                                                    buildScript: '',
                                                    'arguments': '',
                                                    buildHead: 0,
                                                    dockerImageId: image.Id,
                                                    imageTag: image.RepoTags[0]}});
            }
          });
        }
        else {
          containerDefinitions.push({id: image.Id,
                                     name: image.RepoTags[0],
                                     type: 'docker',
                                     specific: {repositoryUrl: '',
                                                buildScript: '',
                                                'arguments': '',
                                                buildHead: 0,
                                                dockerImageId: image.Id,
                                                imageTag: image.RepoTags[0]}});
        }
      });
      cb();
    });
  }, done);
};


