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
var docker = require('./lib/docker-containers');
var postProcessing = require('./lib/postProcessing');

/*
{
  "name": "sudc",
  "namespace": "sudc",
  "systemId": "12341234213432143",
  "instanceFilter": "nfd-id",
  "dockerFilters": ["web", "doc-srv", "real-srv", "hist-srv"]
}
*/


//wget http://localhost:2375/containers/json

/**
 * run an analysis on local boot2docker
 *
 * config:
 *
 * Required:
 *  'name':               the system name to use
 *  'namespace':          the system namespace to use
 *  'systemId':           the system id to insert into the generated system definition file
 *
 * Optional:
 *  'instanceFilter':     the tag key to filter instances on (typically nfd-id)
 */
exports.analyze = function analyze(config, cb) {
  var result = {
    'name': '',
    'namespace': '',
    'id': '',
    'containerDefinitions': [
      {
        'name': 'Machine',
        'type': 'virtualbox',
        'specific': {
          'repositoryToken': '04551b154404a852e663aba4c3fa299e04f6e8a5'
        },
        'id': '85d99b2c-06d0-5485-9501-4d4ed429799c'
      },
    ],
    'topology': {
      'containers': {
        '10': {
          'id': '10',
          'containerDefinitionId': '85d99b2c-06d0-5485-9501-4d4ed429799c',
          'containedBy': '10',
          'contains': [],
          'specific': {'ipaddress': 'localhost'}
        },
      }
    }
  };
  
  async.eachSeries([
    docker.fetchImages,
    docker.fetchContainers,
    postProcessing
  ], function(func, cb) {
    func(config, result, function(err) {
      if (err) { return cb(err); }
      cb(null);
    });
  }, function(err) { cb(err, result); });
};


