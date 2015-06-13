var stream = require("stream");
var router = require("../");

router.setMap({
    "/my/**/*":"func:testFun",

    "index":"index.html",

    "test?v=*":"my*.html",

    "nihao/**/ho*eo":"**/*.html",

    "/public/bi*/**/*":"public/**/*"
});

router.on("notmatch" , function(){
    console.log('not match\n');
});

router.on("path" , function(path , requestpath){
    console.log("请求路径："+requestpath);
    console.log("路由转换： "+path+"\n");
});

router.on("error" , function(err){
    console.log(err);
});

router.set("testFun" , function(req , res , requestpath){
    console.log("请求路径：" + requestpath);
    console.log("执行方法：testFun\n");
});

test("/public/biz009/stylesheets/css/man.css");
test("/my/1/2/3/4/abs.html?v=22");
test("/index");
test("/test?v=index");
test("/nihao/asd/asd/asd/homemeeo"); 

function test(url){
    var res = new stream.Writable();
    res.writeHead = function(){};
    res._write = function(chunk , enc , done){
        done();
    };

    var req = {
        url:url,
        headers:{
            'accept-encoding':''
        }
    };

    router.route(req , res);
}