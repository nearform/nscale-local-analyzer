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


var findRootId = function(system) {
  var r = _.find(system.topology.containers, function(c) { return c.type === 'blank-container'; });
  return r ? r.id : '10';
};



module.exports = function processContainersAnalyze(config, original, result) {
  var service = config.services.process;
  var containers = service.getDeployedContainers(original);
  var definitions = service.getDeployedDefinitions(original);

  var rootId = findRootId(original);

  _(containers).forEach(function(container) {
    result.topology.containers[container.id] = _.cloneDeep(container);
    if (result.topology.containers[rootId]) {
      result.topology.containers[rootId].contains.push(container.id);
    }
  });

  _(definitions).forEach(function(def) {
    result.containerDefinitions.push(_.cloneDeep(def));
  });
};
