# easy-router

##简易路由

###demo

    var http = require('http');
    var Router = require('easy-router');
    
    var bigpipe = require('./bigpipe/bigpipe');
    var pjax = require('./pjax/pjax');
    var getProgress = require('./upload/upload').getProgress;
    var upload = require('./upload/upload').upload;
    var creeper = require('./creeper/creeper');
    var tdata = require('./transdata/tdata');
    
    //路由表，可以使用*进行字符匹配
    var routerMaps = {
    //  bigpipe
        "bigpipe": "func:bigpipe",
    
    //  pjax
        "pjax/*.html": "func:pjax",
    
    //  creeper
        "creeper": "func:creeper",
    
    //  upload file
        "uindex": "url:upload/index.html",
        "upl": "url:upload/upload.html",
        "getProgress": "func:getProgress",
        "upload": "func:upload",
    
    //    静态资源
        "/public/**/*":"url:../public/**/*",
    
    //  transdata
        "transdata": "url:transdata/request.html",
        "tdata": "func:tdata"
    }
    
    //实例化一个router
    var router = Router(routerMaps);
    
    //设置上面需要用到的function
    router.set('bigpipe' , bigpipe);
    router.set('pjax' , pjax);
    router.set('getProgress' , getProgress);
    router.set('upload' , upload);
    router.set('creeper' , creeper);
    router.set('tdata' , tdata);
    
    //直接交给router进行处理
    http.createServer(function(req , res){
        router.route(req , res);
    }).listen(9030);
    
    console.log("服务启动成功...");
