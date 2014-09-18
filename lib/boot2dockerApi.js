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

var request = require('request');

/**
 * Resolves docker URL from $DOCKER_HOST or defaults to http://localhost:2375
 */
var resolveDockerURL = function() {
  if (process.env.DOCKER_HOST) {
    var split = /tcp:\/\/([0-9.|localhost]+):([0-9]+)/g.exec('tcp://127.0.1.1:1235');
    return 'http://' + split[1] + ':' + split[2];
  }
  return 'http://localhost:2375';
};
var dockerURL = resolveDockerURL();

exports.images = function(cb) {
  request(dockerURL + '/images/json', function (error, response, body) {
    if (error) {
      return cb(error);
    }

    if (response.statusCode !== 200) {
      error = new Error('Docker returned status code ' + response.statusCode);
      cb(error, null);
    }

    cb(null, JSON.parse(body));
  });
};

exports.containers = function(cb) {
  request(dockerURL + '/containers/json', function (error, response, body) {
    if (!error && response.statusCode === 200) {
      cb(null, JSON.parse(body));
    }
    else {
      cb(response.statusCode, null);
    }
  });
};

