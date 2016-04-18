# easy-router

[![NPM version][npm-image]][npm-url]
[![Downloads][downloads-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coverage Status][coveralls-image]][coveralls-url]

### 简易路由，可以快速创建http服务，用于测试本地项目

> 模块是自己写来用于快速方便创建文件服务, 或者http服务的, 不依赖任何外部模块, 写着练手, 自己觉得挺方便好用的~

## Install
```
npm install easy-router
```
或
```
npm install easy-router -g
```

## Usage
### 快速使用
```javascript
var Router = require("easy-router");
Router().setMap('**/**' , '**/*').listen(3030)
```

### 接入server
```javascript
var Router = require("easy-router");
var maps = {
  "/topic/*":"./pratice/topic_*.html",        // 页面访问
  "*, *_360, *_baidu":"html/Topic/*.html",    // 可以用逗号相隔
  "/public/**/*":"./public/biz009/**/*",      // 静态资源
  "/runMethod":function(req , res){           // 可以加方法
    res.end("test")
  }
}
var router = Router({
    root: __dirname,    // 项目根目录
    maps: maps,         // 初始的路由表
    useZlib: true,      // 使用gzip压缩
    useCache: true,     // 使用http缓存, 默认为false
    maxCacheSize: 1     // 凡是小于maxCacheSize的资源将以文件内容的md5值作为Etag，单位为MB
});

http.createServer(function(req , res){
    router.route(req , res);
}).listen(3030);
```

### 命令行启动
> 需全局安装easy-router

在想创建文件服务的目录下执行`router`并按回车<br>
默认端口为`33750`，如果输入命令时添加端口号：`router -p 9030`，则会使用命令里的端口<br>

> 如果当前端口被占用，则会自动分配一个可用端口

![image](http://whxaxes.github.io/easy-router/images/test2.jpg "test")

服务启动后，访问:`http://localhost:33750/` 即可看到网站根目录的文件列表<br>
如果输入filename为`/:keyword`，则会列出文件名内含`keyword`字符的文件/文件夹，如果`keyword`为空则会列出全部文件/文件夹<br>
![image](http://whxaxes.github.io/easy-router/images/test4.jpg "test")

## Rules
`**`代表匹配多级目录, `*`代表匹配字符

1.当规则如下时, 则当我访问`/topic/test`的时候, 将会解析成访问`./pratice/topic_test.html`
```javascript
{"/topic/*": "./pratice/topic_*.html"}
```

2.当规则如下时, 当我访问`/public/javascript/app/index.js`, 将会解析成访问`./dist/public/javascript/app/index.js`
```javascript
{"/public/**/*": "./dist/public/**/*"}
```

3.当规则如下时, 则可以按照文件路径访问项目目录下所有文件
```javascript
{"**/*", "**/*"}
```


## API
### Router(options)
实例化一个router对象

### router.listen(port);
监听端口，执行该方法会自动创建http server, 该方法返回http server对象

### router.setMap(maps);
添加路由映射，该方法返回router对象

### router.routeTo(req , res , filepath , headers);
根据路径引导路由至相应文件，可以添加响应头headers

### router.error(res);
定向至错误页面

<br>
## Options
实例化router对象时传入的参数：

### root
项目根目录, 默认为./

### maps
路由表, 可以在初始化时传入相应路由表

### useCache
默认值为false，是否使用简易http缓存

### useZlib
默认值为true，是否开启gzip压缩

## Test
```
make test
```
或者
```
make cover
```

## Author
whxaxes

## License

MIT.

[npm-url]: https://npmjs.org/package/easy-router
[downloads-image]: http://img.shields.io/npm/dm/easy-router.svg?style=flat-square
[npm-image]: http://img.shields.io/npm/v/easy-router.svg?style=flat-square
[travis-url]: https://travis-ci.org/whxaxes/easy-router
[travis-image]: http://img.shields.io/travis/whxaxes/easy-router.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/whxaxes/easy-router
[coveralls-image]: https://img.shields.io/coveralls/whxaxes/easy-router.svg?style=flat-square
