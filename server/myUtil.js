//一些常用的函数丢在这里

const fs = require("fs")

function logTime() {
    const t = new Date();
    var h = t.getHours().toString();
    if (h.length == 1) h = "0" + h;
    var m = t.getMinutes().toString();
    if (m.length == 1) m = "0" + m;
    var s = t.getSeconds().toString();
    if (s.length == 1) s = "0" + s;
    return "[" + h + ":" + m + ":" + s + "]";
}

function log(msg) {
    console.log(logTime() + "[LOG]" + msg)
}

function warn(msg) {
    console.log("\x1B[33m" + logTime() + "[WARN]" + msg + "\x1B[39m")
}

function error(msg) {
    console.log("\x1B[31m" + logTime() + "[ERROR]" + msg + "\x1B[39m")
}

function formatSize(size, useLitePower) {
    var sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB", "BB", "NB", "DB"];
    var unit = 0;
    var power = useLitePower ? 1000 : 1024;
    while (size > power && unit < sizes.length) {
        unit++;
        size = size / power
    }
    return size.toFixed(2) + sizes[unit];
}

function getFileSize(path) {
    var size = 0
    files = fs.readdirSync(path);
    for (var file in files) {
        var states = fs.statSync(path + "/" + files[file]);
        if (states.isDirectory()) {
            size += getFileSize(path + "/" + files[file]);
        } else {
            const wfile = fs.readFileSync(path + "/" + files[file]);
            size += wfile.length;
        }
    }
    return size;
}

exports.logTime = logTime;
exports.log = log;
exports.error = error;
exports.warn = warn;
exports.formatSize = formatSize;
exports.getFileSize = getFileSize;
