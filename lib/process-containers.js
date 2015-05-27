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

var _ = require('lodash');
var procHandler = require('nscale-process-handler')();



var findRootId = function(system) {
  var r = _.find(system.topology.containers, function(c) { return c.type === 'blank-container'; });
  return r ? r.id : '10';
};


module.exports = function processContainersAnalyze(config, original, result, cb) {
  var rootId = findRootId(original);

  procHandler.readPidDetails(function(err, details) {
    if (err) { return cb(err); }
    _.each(details, function(detail) {
      if (original.topology.containers[detail.containerId]) {
        result.topology.containers[detail.containerId] = _.cloneDeep(original.topology.containers[detail.containerId]);
        result.topology.containers[rootId].contains.push(detail.containerId);
        result.topology.containers[detail.containerId].containedBy = rootId;
        result.topology.containers[detail.containerId].pid = detail.pid;

        var def = _.find(original.containerDefinitions, function(cdef) { return cdef.id === detail.containerDefinitionId; });
        result.containerDefinitions.push(_.cloneDeep(def));
      }
    });
    cb(null, result);
  });
};


