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

var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var async = require('async');
var running = require('is-running');


var findRootId = function(system) {
  var r = _.find(system.topology.containers, function(c) { return c.type === 'blank-container'; });
  return r ? r.id : '10';
};



var readPidList = function(cb) {
  var dir = path.join(process.env.HOME, '/.nscale/data');
  var pidList = [];

  fs.readdir(dir, function(err, files) {
    if (err) { return cb(err); }
    async.filter(files, function(file, callback) { callback(file.indexOf('.pid') > 0); }, function(pidFiles) {
      _.each(pidFiles, function(pidFile) {
        pidList.push(pidFile.replace('.pid', ''));
      });
      cb(null, pidList);
    });
  });
};



var purgeDeadProcesses = function (pidList, cb) {
  var dir = path.join(process.env.HOME, '/.nscale/data');
  var livePids = [];

  if (pidList.length === 0) {
    return cb(null, livePids);
  }

  async.eachSeries(pidList, function(pid, next) {
    if (running(parseInt(pid, 10))) {
      livePids.push(pid);
    }
    else {
      try {
        fs.unlinkSync(path.join(dir, pid + '.pid'));
      }
      catch (e) {
      }
    }
    next();
  }, function(err) {
    cb(err, livePids);
  });
};



/**
 * the pid file contains JSON of the following format
 * {
 *   pid: '',
 *   containerId: '',
 *   containerDefinitionId: ''
 * }
 */
var readDetails = function(pidList, cb) {
  var dir = path.join(process.env.HOME, '/.nscale/data');
  var details = [];

  if (pidList.length === 0) {
    return cb(null, details);
  }

  async.eachSeries(pidList, function(pid, next) {
    fs.readFile(path.join(dir, pid + '.pid'), 'utf8', function(err, data) {
      try {
        details.push(JSON.parse(data));
        next();
      }
      catch (err) {
        next(err);
      }
    });
  }, function(err) {
    cb(err, details);
  });
};



var getDeployedDetails = function(cb) {
  readPidList(function(err, pidListFull) {
    if (err) { return cb(err); }
    purgeDeadProcesses(pidListFull, function(err, pidList) {
      if (err) { return cb(err); }
      readDetails(pidList, function(err, details) {
        cb(err, details);
      });
    });
  });
};



module.exports = function processContainersAnalyze(config, original, result, cb) {
  var rootId = findRootId(original);
  debugger;

  getDeployedDetails(function(err, details) {
    debugger;
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


