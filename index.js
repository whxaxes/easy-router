"use strict";
var fs = require("fs");
var url = require("url");
var events = require("events");
var util = require("util");

var mimes = '.asx,video/x-ms-asf,.xml,text/xml,.tsv,text/tab-separated-values,.ra,audio/x-pn-realaudio,.sv4crc,application/x-sv4crc,.spc,application/x-pkcs7-certificates,.pmc,application/x-perfmon,.lit,application/x-ms-reader,.crd,application/x-mscardfile,.isp,application/x-internet-signup,.wmlsc,application/vnd.wap.wmlscriptc,.vst,application/vnd.visio,.xlam,application/vnd.ms-excel.addin.macroEnabled.12,.ttf,application/octet-stream,.pfm,application/octet-stream,.csv,application/octet-stream,.aaf,application/octet-stream,.one,application/onenote,.hta,application/hta,.atom,application/atom+xml,.323,text/h323,.mhtml,message/rfc822,.midi,audio/mid,.p7r,application/x-pkcs7-certreqresp,.mny,application/x-msmoney,.clp,application/x-msclip,.vsd,application/vnd.visio,.lpk,application/octet-stream,.bin,application/octet-stream,.onetoc,application/onenote,.x,application/directx,.wvx,video/x-ms-wvx,.vcf,text/x-vcard,.htc,text/x-component,.htt,text/webviewhtml,.h,text/plain,.mht,message/rfc822,.mid,audio/mid,.p7b,application/x-pkcs7-certificates,.gz,application/x-gzip,.dvi,application/x-dvi,.cpio,application/x-cpio,.vdx,application/vnd.ms-visio.viewer,.sldm,application/vnd.ms-powerpoint.slide.macroEnabled.12,.xlm,application/vnd.ms-excel,.fdf,application/vnd.fdf,.setreg,application/set-registration-initiation,.eps,application/postscript,.p7s,application/pkcs7-signature,.toc,application/octet-stream,.mdp,application/octet-stream,.ics,application/octet-stream,.chm,application/octet-stream,.asi,application/octet-stream,.afm,application/octet-stream,.evy,application/envoy,.wmp,video/x-ms-wmp,.qt,video/quicktime,.mpv2,video/mpeg,.xslt,text/xml,.etx,text/x-setext,.cod,image/cis-cod,.snd,audio/basic,.au,audio/basic,.man,application/x-troff-man,.qtl,application/x-quicktimeplayer,.pmw,application/x-perfmon,.class,application/x-java-applet,.iii,application/x-iphone,.csh,application/x-csh,.z,application/x-compress,.vtx,application/vnd.visio,.vsw,application/vnd.visio,.wps,application/vnd.ms-works,.potx,application/vnd.openxmlformats-officedocument.presentationml.template,.ps,application/postscript,.p7c,application/pkcs7-mime,.thn,application/octet-stream,.mso,application/octet-stream,.dot,application/msword,.doc,application/msword,.sgml,text/sgml,.nws,message/rfc822,.pbm,image/x-portable-bitmap,.ief,image/ief,.wav,audio/wav,.texi,application/x-texinfo,.mvb,application/x-msmediaview,.hdf,application/x-hdf,.vsx,application/vnd.visio,.dotm,application/vnd.ms-word.template.macroEnabled.12,.docm,application/vnd.ms-word.document.macroEnabled.12,.pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation,.psm,application/octet-stream,.java,application/octet-stream,.eot,application/octet-stream,.jar,application/java-archive,.mpeg,video/mpeg,.xsf,text/xml,.map,text/plain,.uls,text/iuls,.rf,image/vnd.rn-realflash,.m3u,audio/x-mpegurl,.wma,audio/x-ms-wma,.aifc,audio/aiff,.mdb,application/x-msaccess,.mvc,application/x-miva-compiled,.stl,application/vnd.ms-pki.stl,.ppsx,application/vnd.openxmlformats-officedocument.presentationml.slideshow,.xlsb,application/vnd.ms-excel.sheet.binary.macroEnabled.12,.setpay,application/set-payment-initiation,.prm,application/octet-stream,.mix,application/octet-stream,.lzh,application/octet-stream,.hhk,application/octet-stream,.onepkg,application/onenote,.xaf,x-world/x-vrml,.flr,x-world/x-vrml,.IVF,video/x-ivf,.cnf,text/plain,.asm,text/plain,.tiff,image/tiff,.wax,audio/x-ms-wax,.ms,application/x-troff-ms,.tcl,application/x-tcl,.shar,application/x-shar,.sh,application/x-sh,.nc,application/x-netcdf,.hlp,application/winhlp,.oda,application/oda,.pfb,application/octet-stream,.fla,application/octet-stream,.wm,video/x-ms-wm,.rgb,image/x-rgb,.ppm,image/x-portable-pixmap,.ram,audio/x-pn-realaudio,.sit,application/x-stuffit,.dir,application/x-director,.mpp,application/vnd.ms-project,.xla,application/vnd.ms-excel,.ssm,application/streamingmedia,.axs,application/olescript,.ods,application/oleobject,.psp,application/octet-stream,.jpb,application/octet-stream,.wrz,x-world/x-vrml,.m1v,video/mpeg,.mno,text/xml,.cmx,image/x-cmx,.jpeg,image/jpeg,.dib,image/bmp,.rmi,audio/mid,.aiff,audio/aiff,.wmd,application/x-ms-wmd,.wri,application/x-mswrite,.pub,application/x-mspublisher,.ins,application/x-internet-signup,.wks,application/vnd.ms-works,.xls,application/vnd.ms-excel,.ai,application/postscript,.crl,application/pkix-crl,.qxd,application/octet-stream,.dwp,application/octet-stream,.xof,x-world/x-vrml,.wmv,video/x-ms-wmv,.nsc,video/x-ms-asf,.mpa,video/mpeg,.pnm,image/x-portable-anymap,.rpm,audio/x-pn-realaudio-plugin,.aif,audio/x-aiff,.me,application/x-troff-me,.pml,application/x-perfmon,.trm,application/x-msterminal,.m13,application/x-msmediaview,.js,application/x-javascript,.dxr,application/x-director,.potm,application/vnd.ms-powerpoint.template.macroEnabled.12,.xltx,application/vnd.openxmlformats-officedocument.spreadsheetml.template,.xlt,application/vnd.ms-excel,.xlc,application/vnd.ms-excel,.p10,application/pkcs10,.smi,application/octet-stream,.sea,application/octet-stream,.hqx,application/mac-binhex40,.spl,application/futuresplash,.movie,video/x-sgi-movie,.lsf,video/x-la-asf,.txt,text/plain,.jfif,image/pjpeg,.jpe,image/jpeg,.zip,application/x-zip-compressed,.wmf,application/x-msmetafile,.m14,application/x-msmediaview,.latex,application/x-latex,.wcm,application/vnd.ms-works,.pptm,application/vnd.ms-powerpoint.presentation.macroEnabled.12,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.hhp,application/octet-stream,.aca,application/octet-stream,.accdb,application/msaccess,.jcz,application/liquidmotion,.wrl,x-world/x-vrml,.wmx,video/x-ms-wmx,.asr,video/x-ms-asf,.lsx,video/x-la-asf,.xsl,text/xml,.html,text/html,.tif,image/tiff,.der,application/x-x509-ca-cert,.pfx,application/x-pkcs12,.p12,application/x-pkcs12,.ppsm,application/vnd.ms-powerpoint.slideshow.macroEnabled.12,.cur,application/octet-stream,.accdt,application/msaccess,.hdml,text/x-hdml,.htm,text/html,.xbm,image/x-xbitmap,.jpg,image/jpeg,.texinfo,application/x-texinfo,.ppam,application/vnd.ms-powerpoint.addin.macroEnabled.12,.xlw,application/vnd.ms-excel,.rm,application/vnd.rn-realmedia,.pdf,application/pdf,.rar,application/octet-stream,.psd,application/octet-stream,.inf,application/octet-stream,.emz,application/octet-stream,.dsp,application/octet-stream,.onea,application/onenote,.jck,application/liquidmotion,.mpe,video/mpeg,.mp2,video/mpeg,.sct,text/scriptlet,.ras,image/x-cmu-raster,.swf,application/x-shockwave-flash,.wmz,application/x-ms-wmz,.gtar,application/x-gtar,.dcr,application/x-director,.sldx,application/vnd.openxmlformats-officedocument.presentationml.slide,.pps,application/vnd.ms-pps,.p7m,application/pkcs7-mime,.xsn,application/octet-stream,.ocx,application/octet-stream,.accde,application/msaccess,.mov,video/quicktime,.wmls,text/vnd.wap.wmlscript,.cpp,text/plain,.c,text/plain,.bas,text/plain,.css,text/css,.art,image/x-jg,.mp3,audio/mpeg,.t,application/x-troff,.roff,application/x-troff,.tar,application/x-tar,.hhc,application/x-oleobject,.scd,application/x-msschedule,.pko,application/vnd.ms-pki.pko,.sst,application/vnd.ms-pki.certstore,.ppt,application/vnd.ms-powerpoint,.xtp,application/octet-stream,.u32,application/octet-stream,.pcx,application/octet-stream,.msi,application/octet-stream,.exe,application/octet-stream,.asd,application/octet-stream,.onetoc2,application/onenote,.fif,application/fractals,.mpg,video/mpeg,.vml,text/xml,.xdr,text/plain,.vcs,text/plain,.hxt,text/html,.eml,message/rfc822,.xpm,image/x-xpixmap,.ico,image/x-icon,.gif,image/gif,.dwf,drawing/x-dwf,.src,application/x-wais-source,.tr,application/x-troff,.pmr,application/x-perfmon,.pma,application/x-perfmon,.dll,application/x-msdownload,.bcpio,application/x-bcpio,.wmlc,application/vnd.wap.wmlc,.wdb,application/vnd.ms-works,.dotx,application/vnd.openxmlformats-officedocument.wordprocessingml.template,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pot,application/vnd.ms-powerpoint,.xltm,application/vnd.ms-excel.template.macroEnabled.12,.rtf,application/rtf,.prf,application/pics-rules,.snp,application/octet-stream,.cab,application/octet-stream,.avi,video/x-msvideo,.asf,video/x-ms-asf,.dtd,text/xml,.wml,text/vnd.wap.wml,.vbs,text/vbscript,.rtx,text/richtext,.dlm,text/dlm,.xwd,image/x-xwindowdump,.pgm,image/x-portable-graymap,.bmp,image/bmp,.crt,application/x-x509-ca-cert,.ustar,application/x-ustar,.tex,application/x-tex,.sv4cpio,application/x-sv4cpio,.tgz,application/x-compressed,.cdf,application/x-cdf,.vss,application/vnd.visio,.cat,application/vnd.ms-pki.seccat,.thmx,application/vnd.ms-officetheme,.xlsm,application/vnd.ms-excel.sheet.macroEnabled.12,.prx,application/octet-stream,.pcz,application/octet-stream,.onetmp,application/onenote,.acx,application/internet-property-stream,.wsdl,text/xml,.disco,text/xml,.xsd,text/xml,.wbmp,image/vnd.wap.wbmp,.png,image/png,.pnz,image/png,.smd,audio/x-smd,.smz,audio/x-smd,.smx,audio/x-smd,.mmf,application/x-smaf'.split(",");
var ALL_FOLDER_REG = /\/\*\*\//g;
var ALL_FOLDER_REG_STR = '/([\\w_]\/)*';
var ALL_FILES_REG = /\*+/g;
var ALL_FILES_REG_STR = '[\\w._]+';
var noop = function () {};

var Router = function (arg) {
    this.methods = {};

    if ((typeof arg == "object") && !(arg instanceof Array)) {
        this.maps = arg;
    } else if (typeof arg == "string") {
        try {
            var json = fs.readFileSync(arg).toString();
            this.maps = eval('(' + json + ')');
        } catch (e) {
            console.log(e);
            this.maps = {};
        }
    } else {
        this.maps = {};
    }

    this.handleMaps();
};

//继承事件类
util.inherits(Router, events.EventEmitter);

var rp = Router.prototype;

rp.constructor = Router;

rp.handleMaps = function () {
    this.filters = [];  //存放根据key转化的正则
    this.address = [];  //存放相应的地址

    for (var k in this.maps) {
        var fil = trim(k);
        var ad = trim(this.maps[k]);

        fil = fil.charAt(0) == "/" ? fil : ("/" + fil);

        ad = ad.replace(ALL_FOLDER_REG, '__A__').replace(ALL_FILES_REG, '__B__');
        fil = fil.replace(ALL_FOLDER_REG, '__A__').replace(ALL_FILES_REG, '__B__');

        this.filters.push(fil);
        this.address.push(ad);
    }
};

rp.set = function (name, func) {
    if (!name)return;

    this.method[name] = (func instanceof Function) ? func : noop;
};

rp.route = function (req, res) {
    var urlobj = url.parse(req.url);
    var pathname = urlobj.pathname;

    var i = 0;
    var match = false;
    var fil;

    for (; i < this.filters.length; i++) {
        fil = this.filters[i];
        var reg = new RegExp(fil.replace(/__A__/g, ALL_FOLDER_REG_STR).replace(/__B__/g, ALL_FILES_REG_STR));
        if (reg.test(pathname)) {
            match = true;
            break;
        }
    }

    if (match) {
        var ad = this.address[i];
        var array = ad.split(':' , 2);

        if(array[0] === "url"){
            //如果是url则查找相应url的文件
            ad = array[1];

            console.log(pathname);
            console.log(fil);
            console.log(ad);

        }else if(array[0] === "func" && (array[1] in this.methods)){
            //如果是func则执行保存在methods里的方法
            this.methods[array[1]].call(this , req , res , urlobj);
        }else {
            throw new Error("route Error");
        }
    }else {
        var result = this.emit("notmatch", res);
        if (!result) {
            res.writeHead(404);
            res.end("404 not found");
        }
    }
};

function trim(str) {
    return str.replace(/(^(\s+))|((\s+)$)/g, '');
}

module.exports = function (arg) {
    return new Router(arg);
};