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


describe('filter test', function() {
  it('should correctly setup filters', function(done){
    var config = {};
    var system = {name: 'test',
                  namespace: 'test',
                  containerDefinitions: [{name: 'test/web', type: 'docker'},
                                         {name: 'test/service', type: 'docker'},
                                         {name: 'progrium/consul', type: 'docker'},
                                         {name: 'wibble/fishtestfish', type: 'docker'},
                                         {name: 'dockerfile/postgres', type: 'docker'}]};
    an.initFilters(config, system);
    an.initFilters(config, system);
    assert(config.dockerFilters.length === 4);
    assert(config.dockerFilters[0] === 'test');
    assert(config.dockerFilters[1] === 'progrium/consul');
    assert(config.dockerFilters[2] === 'wibble/fishtestfish');
    assert(config.dockerFilters[3] === 'dockerfile/postgres');
    done();
  });
});

