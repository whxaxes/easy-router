"use strict";

var http = require("http");
var fs = require("fs");
var url = require("url");
var events = require("events");
var util = require("util");
var path = require("path");
var zlib = require("zlib");
var crypto = require("crypto");
var stream = require("stream");
var querystring = require("querystring");

var mimes = require("./mimes");
var color = require("./color");
var _ = require("./util");

var ALL_FOLDER_REG = /(?:\/|^)\*\*\//g;
var ALL_FOLDER_REG_STR = '/(?:[\\w\\u4e00-\\u9fa5._-]*\/)*';
var ALL_FILES_REG = /\*+/g;
var ALL_FILES_REG_STR = '[\\w\\u4e00-\\u9fa5._-]*';
var AB_RE_2 = /__(A|B)__/g;
var GREP_RE = /\/:[a-z]+$/i;

//允许使用缓存和gzip压缩的文件类型
var cacheAllow = ['image/bmp','image/jpeg','image/png','image/gif','application/x-javascript', 'text/css'];
var gzipAllow = ['application/x-javascript', 'text/css', 'text/plain', 'text/html', 'text/xml'];

var noop = function () {};
var cache = {};

var default_name = "index";
var default_suffix = ".html";

var FUN_NAME = "easy_router_function_";
var SEQ = 1000000;

function Router(){}

//继承事件类
util.inherits(Router, events.EventEmitter);

var rp = Router.prototype;

/**
 * 路由初始化
 * @param options
 * @returns {Router}
 */
rp.init = function(options){
    this.inited = true;
    this.methods = {};
    this.maps = {};
    this.filters = [];//存放根据key转化的正则
    this.address = [];//存放相应的地址

    var defaults = {
        debug:false,        //如果开启debug模式，则进入自动检索当前目录文件模式
        useZlib:true,
        useCache:false,     //如果设为true，则使用http缓存
        maxCacheSize:0.5      //凡是小于maxCacheSize的资源将以文件内容的md5值作为Etag，单位为MB
    };

    for (var key in defaults) {
        this[key] = (_.isObject(options) && (key in options)) ? options[key] : defaults[key];
    }

    return this;
};

/**
 * 调用该方法，则会直接启动服务
 * @param port
 * @param callback
 * @returns {*}
 */
rp.listen = function(port , callback){
    var that = this;
    var server = http.createServer(function(req , res){
        that.route(req , res);
    }).listen(port);

    server.on('error' , function(err){
        if(callback && typeof callback=="function"){
            callback.apply(that , arguments);
        }else {
            throw new Error(err);
        }
    });

    server.on("listening" , function(){
        console.log("服务启动，监听" + color(server.address().port, "green") + "端口中...");
    });

    return server;
};

/**
 * 处理路由映射表
 * @param maps  映射表，字典
 * @private
 */
rp._handleMaps = function (maps) {
    var that = this;
    var ad,adList;

    maps = maps || this.maps;

    _.each(maps, function (map, k) {
        if (_.isString(map)) {
            map = map.trim();

            if (map.indexOf(":") >= 0) {
                ad = map.split(':', 2);
            } else {
                ad = ['url', map];
            }

            if (ad[0] === "url") {
                adList = ad[1].split("/");

                //地址文件名正则，比如1.0/**/*.js中的*.js => /^([\w\u4e00-\u9fa5._-]*)\.js$/
                ad[2] = new RegExp("^" + adList[adList.length - 1].replace(ALL_FILES_REG, "(" + ALL_FILES_REG_STR + ")") + "$");

                //将整个地址的正则用占位符取代保存
                ad[1] = ad[1].replace(ALL_FOLDER_REG, '__A__').replace(ALL_FILES_REG, '__B__');
            }
        } else if (_.isFunction(map)) {
            ad = ["func", FUN_NAME + SEQ];
            that.methods[FUN_NAME + SEQ] = map;
            SEQ++;
        } else {
            return;
        }

        that.address.push(ad);

        _.each(k.split(","), function (f) {
            f = f.trim();
            f = f.charAt(0) == "/" ? f : ("/" + f);
            f = f.replace(/\?/g, "\\?");

            var fil = f.replace(ALL_FOLDER_REG, '__A__').replace(ALL_FILES_REG, '__B__');
            var re = new RegExp("^" + fil.replace(/__A__/g, ALL_FOLDER_REG_STR).replace(/__B__/g, ALL_FILES_REG_STR) + "$");

            that.filters.push([fil, re, that.address.length-1]);
        })
    })
};

/**
 * 添加设置路由映射表
 * @param maps  映射表，字典
 * @returns {Router}
 */
rp.setMap = function(maps){
    if(!this.inited) this.init();

    if(_.isObject(maps) && !_.isArray(maps)){
        for(var k in maps){
            this.maps[k] = maps[k];
        }
    }else if(_.isString(maps) && arguments.length == 2){
        this.maps[maps] = arguments[1];
        var key = maps;
        maps = {};
        maps[key] = arguments[1]
    }else {
        return;
    }

    this._handleMaps(maps);

    return this;
};

/**
 * 设置方法，以便绑定方法的路由能找到执行方法
 * @param name
 * @param func
 */
rp.set = function (name, func) {
    if (!name)return;

    this.methods[name] = _.isFunction(func) ? func : noop;
};

/**
 * 路由引导方法，如果想绑定自己实例化的http对象，则如下面的例子调用
 * 否则直接调用listen方法，router会自动创建http服务
 * @param req       IncomingMessage
 * @param res       ClientRequest
 *
 * 例：
 * http.createServer(function(req , res){
 *      router.route(req , res)
 * })
 */
rp.route = function (req, res) {
    if (!this.inited) this.init();

    var reqUrl = decodeURIComponent(decodeURI(req.url)),
        urlobj = url.parse(reqUrl),
        filters = this.filters,
        address = this.address,
        fil, ads, suitpath;

    var result_1, result_2;

    req.params = urlobj.search ? querystring.parse(urlobj.query) : {};

    for (var i = 0, len = filters.length; i < len; i++) {
        fil = filters[i];
        ads = address[fil[2]];

        //如果filter中有?号或者#号，则相应更改用来匹配的url
        suitpath = fil[0].indexOf("?") >= 0 ? urlobj.path : urlobj.pathname;
        if (fil[0].indexOf("#") >= 0) {
            suitpath += urlobj.hash || "";
        }

        //url检测
        result_1 = this._processUrl(req, res, fil, ads, suitpath);

        //方法检测
        result_2 = this._processMethod(req, res, fil, ads, suitpath);

        if (result_1 || result_2) return;
    }

    if (reqUrl === "/favicon.ico") {
        this.routeTo(req, res, path.normalize(__dirname + "/../favicon.jpg"));
        return;
    }

    console.log(color("404 get " + reqUrl, "gray"));

    this.emit("notmatch");

    this.error(res);
};

/**
 * 处理路由引导至具体文件的函数
 * @returns {boolean}
 * @private
 */
rp._processUrl = function(req, res, fil, ads, suitpath){
    var grepExt = "",
        grepList = [],
        filepath, urlList;

    if (ads[0] !== "url") return false;

    //如果处于debug状态，则获取http://localhost:1260/:XXX中的XXXX
    if (this.debug) {
        suitpath = suitpath.replace(GREP_RE, function (m) {
            grepExt = m.substring(2, m.length).toLowerCase();
            return "/";
        });
    }

    //如果不匹配则直接跳过
    if (!fil[1].test(suitpath)) return false;

    //解析路径
    filepath = this._parsePath(fil[0], ads[1], suitpath);
    this.emit("path", filepath, suitpath);

    //如果解析后的路径不存在
    if (!fs.existsSync(filepath)) return false;

    //如果路径是文件夹
    if (_.isDir(filepath)) {
        if (this.debug) {
            //获取路径下的文件列表，如果有检索关键词则获取所有文件
            urlList = this._getFolderList(filepath, ads[2], !!grepExt);

            //如果有检索关键词，则根据检索关键词对文件进行再过滤
            if (!!grepExt) {
                console.log(color("200 get " + filepath + ":" + grepExt, "green"));
                _.each(urlList, function (f) {
                    if (f.name.indexOf("." + grepExt) >= 0) {
                        grepList.push(f);
                    }
                });
                urlList = grepList;
            } else {
                console.log(color("200 get " + filepath, "green"));
            }

            res.end(this._renderMenu(urlList));

            return true;
        }

        //添加默认文件名
        filepath += default_name + default_suffix;
    } else if (!path.extname(filepath) && !fs.existsSync(filepath)) {
        //添加后缀名
        filepath += default_suffix;
    }

    if (this.routeTo(req, res, filepath)) {
        this.emit("match", filepath, suitpath);
        return true;
    }

    return false;
};

/**
 * 把数组里的链接整合到menu.html
 * @param arr       链接集合
 * @returns {string}
 * @private
 */
rp._renderMenu = function(arr){
    if(!_.isArray(arr)) return "";

    var html = fs.readFileSync(__dirname + "/../" + "menu.html").toString();

    var content = "";
    _.each(arr , function(f){
        content += '<span><a href="' + f.path + '">' + f.name + '</a></span>';
    });

    return html.replace("@@content" , content || "无匹配文件");
};

/**
 * 处理路由引导至方法的函数
 * @returns {boolean}
 * @private
 */
rp._processMethod = function(req, res, fil, ads, suitpath){
    if(ads[0] !== "func" || !fil[1].test(suitpath) || !this.methods[ads[1]]) return false;



    this.methods[ads[1]].call(this, req, res, suitpath);

    return true;
};

/**
 * 根据路径引导路由至相应文件
 * @param req           IncomingMessage
 * @param res           ClientRequest
 * @param filepath      文件地址
 * @param headers       自定义header
 * @returns {boolean}   是否成功链接至相关文件
 */
rp.routeTo = function(req , res , filepath , headers){
    var that = this;
    var accept = req.headers['accept-encoding'];
    var etag,times;

    if(!fs.existsSync(filepath)) return false;

    var stats = fs.statSync(filepath);

    if(!stats.isFile()) return false;

    var fileKind = path.extname(filepath).toLowerCase();
    var source = fs.createReadStream(filepath);

    var index = mimes.indexOf(fileKind);
    var type = index >= 0 ? mimes[index + 1] : 'text/plain';
    var options = {
        'Content-Type': type + ';charset=utf-8',
        'X-Power-By':'Easy-Router'
    };

    _.each(headers , function(value , k){ options[k] = value; });

    //如果为资源文件则使用http缓存
    if (that.useCache && cacheAllow.indexOf(type) >= 0) {
        options['Cache-Control'] = 'max-age=' + (365 * 24 * 60 * 60 * 1000);
        times = String(stats.mtime).replace(/\([^\x00-\xff]+\)/g , "").trim();

        //先判断文件更改时间
        if (req.headers['if-modified-since'] == times) {
            that.cache(res);
            return true;
        }

        //如果文件小于一定值，则直接将文件内容的md5值作为etag值
        var hash = crypto.createHash("md5");
        if (~~(stats.size / 1024 / 1024) <= +that.maxCacheSize) {
            etag = '"' + stats.size + '-' + hash.update(fs.readFileSync(filepath)).digest("hex").substring(0, 10) + '"';
        } else {
            etag = 'W/"' + stats.size + '-' + hash.update(times).digest("hex").substring(0, 10) + '"';
        }

        //如果文件更改时间发生了变化，再判断etag
        if(req.headers['if-none-match'] === etag){
            that.cache(res);
            console.log(color("304 cache " + filepath , "yellow"));
            return true;
        }

        options['ETag'] = etag;
        options['Last-Modified'] = times;
    }else {
        options['Cache-Control'] = 'no-cache';
    }

    console.log(color("200 get " + filepath , "green"));

    //如果为文本文件则使用zlib压缩
    if(that.useZlib && gzipAllow.indexOf(type) >= 0){
        if(/\bgzip\b/g.test(accept)){
            options['Content-Encoding'] = 'gzip';
            res.writeHead(200, options);

            source.pipe(zlib.createGzip()).pipe(res);
            return true;
        }else if(/\bdeflate\b/g.test(accept)){
            options['Content-Encoding'] = 'deflate';
            res.writeHead(200, options);
            source.pipe(zlib.createDeflate()).pipe(res);
            return true;
        }
    }

    res.writeHead(200, options);

    source.pipe(res);

    return true;
};

/**
 * 根据路由规则，转换请求路径为文件路径
 * @param fil           过滤条件集合
 * @param ads           地址集合
 * @param pathname      路径内容
 * @returns {string}    返回编译过的路径
 * @private
 */
rp._parsePath = function(fil, ads, pathname) {
    var filepath = ads,
        index = 0,
        collector = [],
        p = pathname,
        reg, filArray, adsArray;

    //  解析路径
    if (AB_RE_2.test(fil) && !(AB_RE_2.lastIndex = 0) && AB_RE_2.test(ads)) {
        //将__转成逗号，以便转成数组时不会受到字符串里的下划线干扰
        filArray = fil.replace(AB_RE_2 , ",$1,").split(",");
        adsArray = ads.replace(AB_RE_2 , ",$1,").split(",");

        //先将不需要匹配的字符过滤掉
        _.each(filArray , function(f){
            if (!f) return;

            if (_.isAB(f)) {
                collector.push(f);
            } else {
                p = p.replace(new RegExp(f), '');
            }
        });

        //再根据正则拆分路径
        _.each(collector , function(c){
            reg = new RegExp(c === 'A' ? ALL_FOLDER_REG_STR : ALL_FILES_REG_STR);

            //扫描路径，当遇到AB关键字时处理，如果两者不相等，停下adsArray的扫描，继续执行对filArray的扫描，直至遇到相等数值
            while (index < adsArray.length) {
                if (_.isAB(adsArray[index])) {
                    if (adsArray[index] === c) {
                        adsArray[index] = p.match(reg)[0];
                        index++;
                    }
                    break;
                }
                index++;
            }

            p = p.replace(reg, '');
        });

        filepath = adsArray.join("").trim();
    }

    return filepath.charAt(0) === "/" ? ("." + filepath) : filepath;
};

/**
 * 获取folderpath目录下的文件/文件夹列表
 * @param folderpath    文件目录
 * @param re            用于匹配的文件路径正则
 * @param isAll         是否获取所有文件
 * @returns {*}
 * @private
 */
rp._getFolderList = function(folderpath, re, isAll){
    var folders,
        urlList = [],
        npath;

    if(arguments.length>=2 && _.isBoolean(re)){
        isAll = re;
        re = null;
    }

    getlist(folderpath , isAll);

    return urlList;

    function getlist(fpath , isAll){
        try{
            folders= fs.readdirSync(fpath);
        }catch(e){
            return;
        }

        _.each(folders , function(f){
            var p;
            npath = path.join(fpath , f);
            //如果当前f是文件夹，则添加代表文件夹的分隔符，否则判断文件名是否匹配正则，不匹配则不扔进数组
            if(_.isDir(npath , true)){
                f += "/";

                if(isAll) getlist(npath , true);
            }else if(!re || (_.isRegExp(re) && re.test(f))){
                p = re ? RegExp.$1 : f;
            }else{
                return;
            }

            urlList.push({
                name: f,
                path: p || f
            });
        });
    }
};

/**
 * 404错误
 * @param res
 */
rp.error = function(res){
    var html = '<div style="text-align: center;font: 40px \'微软雅黑\';line-height: 100px;color: #666;">' +
            '(ง •̀_•́)ง┻━┻ <br>' +
            '404 NOT FOUND !!' +
        '</div>';
    res.writeHead(404 , {'content-type':'text/html;charset=utf-8'});
    res.end(html);
};

/**
 * 304缓存
 * @param res
 */
rp.cache = function(res){
    res.writeHead(304);
    res.end();
};

module.exports = Router;