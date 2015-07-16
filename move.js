var vfs = require("vinyl-fs");

vfs.src(['./lib/**/*'])
    .pipe(vfs.dest("C:/Users/Administrator/AppData/Roaming/npm/node_modules/easy-router/lib/"));
