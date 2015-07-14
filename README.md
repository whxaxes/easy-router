# easy-router

### 简易路由，可以快速构建服务，本地项目测试

## Install
    npm install easy-router

## Usage
如果安装到全局
```
npm install easy-router -g
```
则可以直接在项目目录下打开cmd命令窗口：输入：`router`按回车即可开启服务<br>
默认端口为`33750`，如果输入命令时添加端口号：`router 9030`，则会使用命令里的端口，如果当前端口被占用，则会自动分配一个可用端口<br>
![image](http://whxaxes.github.io/easy-router/images/test2.jpg "test")


引用文件示例：最快捷用法
```
var router = require("easy-router");
router.setMap('**/**' , '**/*').listen(3030);
```

如果你希望是接入自己创建的http，只需要使用route方法  
```
var router = require("easy-router");
router.setMap({
    "/topic/*":"./pratice/topic_*.html",      //页面访问

    "* , *_360 , *_baidu":"html/Topic/*.html",

    "/public/**/*":"../public/biz009/**/*"        //静态资源

    "/runMethod":function(req , res){       //执行方法
        res.end("test")
    }
})
```
http.createServer(function(req , res){
    router.route(req , res);
}).listen(3030)

我的[node-test项目](https://github.com/whxaxes/node-test)使用了该路由模块，具体用法可见node-test项目代码。

## API
### router.listen(port);
监听端口，该方法返回http server对象

### router.init(options);
初始化路由，可以不执行。执行setMap的时候router会检测有无初始化，若尚未初始化则自动初始化

### router.setMap(maps);
添加路由映射，该方法返回router对象

### router.routeTo(req , res , filepath , headers);
根据路径引导路由至相应文件，可以添加响应头headers

### router.error(res);
定向至错误页面

<br>
## Options
上面init方法传的参数：
### debug
默认值为false，如果设为true，当设置类似于：
```
{"**/*":"**/*"} 或 {"**/*":"**/*.js"}
```
当我访问某个目录而非文件时，easy-router将会将该目录下的所有匹配的文件夹和文件输出，比如我访问`http://localhost:9030/html/`，
easy-router将会将html目录下的所有文件夹和文件以a标签的形式放在html中输出到浏览器。方便选择性访问。<br>
如：<br>
![image](http://whxaxes.github.io/easy-router/images/test.jpg "test")



### useCache
默认值为false，是否使用简易http缓存

### useZlib
默认值为true，是否开启gzip压缩
