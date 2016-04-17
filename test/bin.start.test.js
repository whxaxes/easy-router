var child_process = require("child_process");
var path = require('path');
var request = require('supertest');
require('chai').should();

describe('/test/bin.start.test.js: 启动器测试', function(){

  it('运行启动器应该能通过', function(done){
    var child = child_process.fork(
      path.join(__dirname, '../bin/start')
    );

    child.on('exit' , function(code){
      if(code !== 0) {
        child.kill('SIGHUP');
      }
    });

    child.on('error' , function(err){
      child.kill('SIGHUP');
      done(err);
    });

    child.once('message', function(data){
      var port = data.port;
      request('http://127.0.0.1:' + port)
        .get('/')
        .expect(200)
        .end(function(err, res){
          child.kill('SIGHUP');
          if(err) return done(err);

          res.text.should.be.have.include(
            'bin/',
            '.gitignore',
            'Makefile'
          );

          done();
        })
    });
  })

});