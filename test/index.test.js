var Router = require('../');
var http = require('http');
var request = require('supertest');
var pedding = require('pedding');
var path = require('path');
require('chai').should();

var router = Router({
  root: __dirname,
  useCache: true,
  silent: true,
  maps: {
    '/my/**/*': 'func:testFun',
    'index': 'view/index.html',
    'test?v=*': 'view/my*.html',
    'nihao/**/ho*eo': 'view/**/*.html',
    '/public/bi*/**/*': 'public/**/*',
    'absolute': path.join(__dirname, './view/index.html'),
    'absolute/**/*': path.join(__dirname, 'public') + '/**/*',
  }
});

var server = router.listen(0);

router.set('testFun', function(req, res, requestpath) {
  res.end('testFun');
});

describe('/test/index.test.js: 访问测试', function(){
  it('应该能成功访问页面index.html', function(done){
    request(server)
      .get('/index')
      .expect('Content-Type', 'text/html;charset=utf-8')
      .expect(200, done);
  });

  it('应该能成功访问静态资源man.css, 再次请求时http缓存生效', function(done){
    done = pedding(2, done);
    request(server)
      .get('/public/biz009/stylesheets/css/man.css')
      .expect('Content-Type', 'text/css;charset=utf-8')
      .expect(200)
      .end(function(err, res){
        // etag 缓存
        request(server)
          .get('/public/biz009/stylesheets/css/man.css')
          .set('if-none-match', res.headers['etag'])
          .expect(304, done);

        // modify time 缓存
        request(server)
          .get('/public/biz009/stylesheets/css/man.css')
          .set('if-modified-since', res.headers['last-modified'])
          .expect(304, done);
      })
  });

  it('应该能成功执行方法testFun', function(done){
    request(server)
      .get('/my/1/2/3/4/abs.html?v=22')
      .expect('testFun', done);
  });

  it('应该能成功访问到bo.html', function(done){
    request(server)
      .get('/nihao/asd/asd/hoboeo')
      .expect(200, done);
  });

  it('访问错误地址响应码应该为404', function(done){
    request(server)
      .get('/public/bz009/stylesheets/css/man.css')
      .expect(404, done);
  });

  it('应该能成功访问到myindex.html', function(done){
    request(server)
      .get('/test?v=index')
      .expect(200, done);
  });

  it('应该能成功访问到favicon', function(done){
    request(server)
      .get('/favicon.ico')
      .expect(200, done);
  });

  it('绝对路径访问应该成功', function(done){
    request(server)
      .get('/absolute')
      .expect(200, done);
  });

  it('绝对路径通配访问应该成功', function(done){
    request(server)
      .get('/absolute/stylesheets/css/man.css')
      .expect(200, done);
  });

  it('开启debug模式访问view目录下的文件应该正常', function(done) {
    request(Router({
      root: __dirname,
      debug: true,
      maps: {'**/*': '**/*'}
    }).listen())
      .get('/view/myindex.html')
      .expect(200, done);
  });

  it('开启debug模式访问view目录, 应该能获得所有目录列表', function(done) {
    request(Router({
      root: __dirname,
      debug: true,
      maps: {'**/*': '**/*'}
    }).listen())
      .get('/view')
      .expect(200)
      .end(function(err, res) {
        if(err) return done(err);
        res.text.should.be.have.include('asd/', 'index.html', 'myindex.html');
        done();
      })
  });

  it('开启debug模式访问view目录, /:html只允许处理html文件', function(done) {
    request(Router({
      root: __dirname,
      debug: true,
      maps: {'**/*': '**/*'}
    }).listen())
      .get('/view/:html')
      .expect(200)
      .end(function(err, res) {
        if(err) return done(err);
        res.text.should.be.not.include('href="asd/"');
        res.text.should.be.have.include('index.html', 'myindex.html');
        done();
      })
  });
});