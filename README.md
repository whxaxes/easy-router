# easy-router

##Install

    npm install easy-router

##Usage

    var http = require('http');
    var Router = require('easy-router');
    var bigpipe = require('./bigpipe/bigpipe');
    var pjax = require('./pjax/pjax');
    
    //路由表，可以使用通配符*匹配，**则代表任意目录
    var routerMaps = {
        "/topic/*" : "url:./topic/topic_*.html",    //比如：访问/topic/1，则会引导至./topic/topic_1.html页面
    
        "bigpipe": "func:bigpipe",      //可以使用func关键字声明这是方法，但是需要在后面使用set设置方法
        
        "pjax/*.html": pjax,    //也可以直接传方法
        
        "/public/**/*":"url:../public/**/*",    //访问public目录下的任意文件均可
    }
    
    //实例化一个router
    var router = Router(routerMaps);
    
    //设置上面需要用到的function
    router.set('creeper' , bigpipe);
    
    //直接交给router进行处理
    http.createServer(function(req , res){
        router.route(req , res);
    }).listen(9030);

###router只会实例化一次。
###在其他模块中引用router，使用router.setMaps可以添加路由
    var router = require("easy-router")();//因为返回的是方法，所以需要执行才能获取router对象
    
    router.setMap({
        'test.html':function(req , res){
            res.end('test')
        }
    })
    
    
