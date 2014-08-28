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
var docker = require('./boot2dockerApi');



/*
 * assumes that the container names take the form
 * searches on container regex and returns the latest based on docker timestamp
 * and latest running
 * 
 * finds the greatest build number 
 * if build number is absent finds the latest by time
 */
var queryImages = function(cb) {
  docker.images(cb);
};



var queryContainers = function(cb) {
  docker.containers(cb);
};



var matchImageToContainer = function(container, results) {
  return _.find(results.containerDefinitions, function(cdef) {
    console.log('-------------------------');
    console.log(cdef.type);
    console.log(cdef.specific.imageTag);
    console.log(container.Image);
    return cdef.type === 'boot2docker' && cdef.specific.imageTag === container.Image;
  });
};



exports.fetchContainers = function fetchContainers(options, result, done) {
  var topologyContainers = result.topology.containers;
//  var containerDefinitions  = result.containerDefinitions;
//  var matches = {};
  var newTopology = {};

//  _.each(options.dockerFilters, function(filter) {
//    matches[filter] = { containerFound: false };
//  });

  async.eachSeries(_.values(topologyContainers), function(instance, cb) {
    queryContainers(function(err, containers) {
      _.each(containers, function(container) {

        if (options.dockerFilters) {
          _.each(options.dockerFilters, function(filter) {
            if (container.Image.indexOf(filter) !== -1) {
              //console.log(JSON.stringify(container, null, 2));
              //console.log(JSON.stringify(result, null, 2));
              //var cdef = matchImageToContainer(container, result) || {id: ''};
              //var cdef = matchImageToContainer(container, result) || {id: '', specific: { dockerImageId: '' }};
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
          //var cdef = matchImageToContainer(container, result) || {id: ''};
          //var cdef = matchImageToContainer(container, result) || {id: '', specific: { dockerImageId: '' }};
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
//  var matches = {};

  debugger;

//  _.each(options.dockerFilters, function(filter) {
//    matches[filter] = { imageFound: false, containerFound: false };
//  });

//  console.log(matches);

  async.eachSeries(_.values(topologyContainers), function(instance, cb) {
    queryImages(function(err, images) {
      _.each(images, function(image) {
        if (options.dockerFilters) {
          _.each(options.dockerFilters, function(filter) {
            if (image.RepoTags[0].indexOf(filter) !== -1) {
              //if (!matches[filter].imageFound) {
                //matches[filter].imageFound = true;
              containerDefinitions.push({id: image.Id,
                                         name: filter,
                                         type: 'boot2docker',
                                         specific: {repositoryUrl: '',
                                                    buildScript: '',
                                                    'arguments': '',
                                                    buildHead: 0,
                                                    dockerImageId: image.Id,
                                                    imageTag: image.RepoTags[0]}});
             //}
            }
          });
        }
        else {
          containerDefinitions.push({id: image.Id,
                                     name: image.RepoTags[0],
                                     type: 'boot2docker',
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


