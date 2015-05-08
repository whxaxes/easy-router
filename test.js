var router = require("./index")({
    "/my/**/*":"func:transRequest",

    "/public/bi*/**/*":"url:../public/**/*"
});

router.on("notmatch" , function(res){
    console.log('not match');
});

router.route({
    url : "/public/biz009/stylesheets/css/man.css"
} , {
    writeHead:function(){},
    end:function(){}
});
