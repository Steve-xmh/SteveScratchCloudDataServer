//一些常用的函数丢在这里

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

exports.logTime = logTime;
exports.log = log;
exports.error = error;
exports.warn = warn;
