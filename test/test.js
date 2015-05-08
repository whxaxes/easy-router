var stream = require("stream");
var router = require("./../index")({
    "/my/**/*":"func:testFun",

    "index":"url:test/index.html",

    "/public/bi*/**/*":"url:test/public/**/*"
});

router.on("notmatch" , function(){
    console.log('not match');
});

router.on("match" , function(path , requestpath){
    console.log("请求路径："+requestpath);
    console.log("==> "+path);
});

router.on("error" , function(err){
    console.log(err);
});

router.set("testFun" , function(req , res , requestpath){
    console.log("请求路径："+requestpath);
    console.log("执行 testFun");
});

describe("check" , function(){
    it("test1" , function(done){
        test("/public/biz009/stylesheets/css/man.css");
        done();
    });

    it("test2" , function(done){
        test("/my/1/2/3/4/abs.html");
        done();
    });

    it("test3" , function(done){
        test("/index");
        done();
    });
});

function test(url){
    var res = new stream.Writable();
    res.writeHead = function(){};
    res._write = function(chunk , enc , done){
        done();
    };

    router.route({
        url : url
    } , res);
}