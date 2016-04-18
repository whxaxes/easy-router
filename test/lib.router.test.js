var Router = require('../lib/router');
var http = require('http');
var path = require('path');
var request = require('supertest');
require('chai').should();

describe('/test/lib.router.test.js: api测试', function() {
  it('执行listen方法传入端口实例化应该正常', function(done){
    Router().listen(3661).address().port.should.be.have.eql(3661);
    done();
  });

  it('执行设置Map时传入对象应该正常', function(done){
    Router().setMap({
      'test2': null,
      '/my/**/*': function(){},
      'index': 'view/index.html'
    });
    done();
  });

  it('执行设置Map时传入null应该正常', function(done){
    Router().setMap(null);
    done();
  });

  it('执行设置Map时传入字符串应该正常', function(done){
    Router().setMap('index', 'view/index.html');
    done();
  });

  it('执行routeTo设置header正常', function(done){
    request(http.createServer(function(req, res){
      Router().routeTo(req, res, path.join(__dirname, 'view/index.html'), {
        'self-defined-header': 'gogo'
      });
    })).get('/test.js')
      .set('accept-encoding', 'deflate')
      .expect('self-defined-header', 'gogo')
      .expect(200, done);
  });

});