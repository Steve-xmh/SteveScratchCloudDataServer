//一些常用的函数丢在这里

const fs = require("fs")

function logTime() {
    const t = new Date();
    //console.log("[" + (t.getHours + 1) + ":" + (t.getMinutes + 1) + ":" + (t.getSeconds + 1) + "]")
    return "[" + (t.getHours() + 1) + ":" + (t.getMinutes() + 1) + ":" + (t.getSeconds() + 1) + "]";
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
    files.forEach(function (file) {
        var states = fs.statSync(path + "/" + file);
        if (states.isDirectory()) {
            size += getFileSize(path + "/" + file);
        } else {
            const file = fs.readFileSync(path + "/" + file);
            size += file.length;
        }
    })
    return size;
}

exports.logTime = logTime;
exports.log = log;
exports.error = error;
exports.warn = warn;
exports.formatSize = formatSize;
exports.getFileSize = getFileSize;
