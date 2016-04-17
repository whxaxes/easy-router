# easy-router

### 简易路由，可以快速构建服务，本地项目测试

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coverage Status][coveralls-image]][coveralls-url]

## Install
```
npm install easy-router
```
或
```
npm install easy-router -g
```

## Usage
##### 启动服务（需全局安装easy-router）<br>
在项目目录下打开cmd命令窗口：输入：`router`按回车即可开启服务<br>
默认端口为`33750`，如果输入命令时添加端口号：`router 9030`，则会使用命令里的端口<br>

> 如果当前端口被占用，则会自动分配一个可用端口

![image](http://whxaxes.github.io/easy-router/images/test2.jpg "test")

##### 访问服务
启动服务后，访问:`http://localhost:33750/` 即可看到网站根目录的文件列表<br>
如果输入filename为`/:keyword`，则会列出文件名内含`keyword`字符的文件/文件夹，如果`keyword`为空则会列出全部文件/文件夹<br>
![image](http://whxaxes.github.io/easy-router/images/test4.jpg "test")

##### 其他启动方式
除了在router后面接端口启动服务外，组件引入了[node-run](https://github.com/whxaxes/wheels/tree/master/node-run)，可以直接启动nodejs文件，同时监听文件改动而重启服务<br>
```
router app.js
```
<br><br>
##### 在文件内中也可以引用，最快捷用法

```javascript
var Router = require("easy-router");
Router().setMap('**/**' , '**/*').listen(3030)
```

##### 使用route方法接入自己创建的http
```javascript
var Router = require("easy-router");
var router = Router({
    root: './',         // 项目根目录
    maps: {             // 初始的路由表
          "/topic/*":"./pratice/topic_*.html",      //页面访问
          "* , *_360 , *_baidu":"html/Topic/*.html",
          "/public/**/*":"../public/biz009/**/*"        //静态资源
          "/runMethod":function(req , res){       //执行方法
              res.end("test")
          }
      },
    debug: false,       // 如果开启debug模式，则进入自动检索当前目录文件模式
    useZlib: true,      // 是否使用gzip压缩
    useCache: false,    // 如果设为true，则使用http缓存
    maxCacheSize: 0.5   // 凡是小于maxCacheSize的资源将以文件内容的md5值作为Etag，单位为MB
})

http.createServer(function(req , res){
    router.route(req , res);
}).listen(3030)

```

## API
### Router(options)
返回一个router对象

### router.listen(port);
监听端口，该方法返回http server对象

### router.setMap(maps);
添加路由映射，该方法返回router对象

### router.routeTo(req , res , filepath , headers);
根据路径引导路由至相应文件，可以添加响应头headers

### router.error(res);
定向至错误页面

<br>
## Options
实例化router对象时传入的参数：

### debug
默认值为false，如果设为true，当设置类似于：
```
{"**/*":"**/*"} 或 {"**/*":"**/*.js"}
```
当我访问某个目录而非文件时，easy-router将会将该目录下的所有匹配的文件夹和文件输出，比如我访问`http://localhost:9030/html/`，
easy-router将会将html目录下的所有文件夹和文件以a标签的形式放在html中输出到浏览器。方便选择性访问。<br>
如：<br>
![image](http://whxaxes.github.io/easy-router/images/test.jpg "test")

### root
项目根目录, 默认为./

### maps
路由表, 可以在初始化时传入相应路由表

### useCache
默认值为false，是否使用简易http缓存

### useZlib
默认值为true，是否开启gzip压缩

## Running Test
```
make test
```

## License

MIT.

[npm-url]: https://npmjs.org/package/easy-router
[npm-image]: http://img.shields.io/npm/v/easy-router.svg?style=flat-square
[travis-url]: https://travis-ci.org/whxaxes/easy-router
[travis-image]: http://img.shields.io/travis/whxaxes/easy-router.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/whxaxes/easy-router
[coveralls-image]: https://img.shields.io/coveralls/whxaxes/easy-router.svg?style=flat-square
