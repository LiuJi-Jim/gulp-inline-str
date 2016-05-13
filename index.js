var through = require('through2')
var fs = require('fs')
var path = require('path')
var gutil = require('gulp-util')

var reg = /\b__inline\s*\(\s*(['"])([^'"*?:<>|\n\r]+)\1\s*\)/g;

function tryReadFile(filePath) {
    if (fs.existsSync(filePath)) {
        return JSON.stringify(fs.readFileSync(filePath).toString());
    }

    return false;
}

module.exports = function(options) {
    return through.obj(function (file, enc, cb) {
        if (file.isNull()) {
            this.push(file);
            return cb();
        }
        if (file.isStream()) {
            this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
            return cb();
        }
        var content = file.contents.toString();
        content = content.replace(reg, function(input, quote, value){
            value = value.replace(/['"]/g, '');
            var isAbsolute = path.isAbsolute(value);
            var filePath;
            var result = false;
            var basePath = options.basePath || __dirname;
            var base;
            if (!isAbsolute) {
                base = path.dirname(file.path)
            } else {
                value = value.replace(/^\//, '')
            }
            if (isAbsolute) {
                value = value.replace(/^\//, '');
                filePath = path.resolve(basePath, value);
                result = tryReadFile(filePath);
            } else {
                var base = path.dirname(file.path);
                filePath = path.resolve(base, value);
                result = tryReadFile(filePath);
                if (!result) {
                    filePath = path.resolve(basePath, value);
                    result = tryReadFile(filePath);
                }
            }
            if (result) {
                return result;
            }else{
                return input;
            }
        });

        file.contents = new Buffer(content);

        this.push(file);
        cb();
    });
}

