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

var an = require('../index');
var assert = require('assert');

describe('canAnalyze', function() {
  it('should return true if it contains docker defs with no ipAddress', function(){
    var sys = {
      containerDefinitions: [{
        type: 'docker'
      }]
    };
    assert(an.canAnalyze(sys));
  });

  it('should return false if it contains blank-container def with ipAddress', function() {
    var sys = {
      containerDefinitions: [{
        type: 'blank-container',
        specific: {
          ipAddress: '192.168.5.2'
        }
      }, {
        type: 'docker'
      }]
    };
    assert(!an.canAnalyze(sys));
  });

  it('should return false if it contains a blank-container def with priveIpAddress', function() {
    var sys = {
      containerDefinitions: [{
        type: 'blank-container',
        specific: {
          privateIpAddress: '192.168.5.2'
        }
      }, {
        type: 'docker'
      }]
    };
    assert(!an.canAnalyze(sys));
  });

  it('should return false if it contains a blank-container def with priveIpAddress', function() {
    var sys = {
      containerDefinitions: [{
        type: 'blank-container',
        specific: {
          ipaddress: '192.168.5.2'
        }
      }, {
        type: 'docker'
      }]
    };
    assert(!an.canAnalyze(sys));
  });
});
