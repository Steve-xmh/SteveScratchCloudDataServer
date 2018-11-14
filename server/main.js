var fs = require("fs");//文件系统
var net = require("net");
var ssServer = require('./server');
const config = require("./config")

if (!fs.existsSync("./users/")) {
    fs.mkdirSync("./users/")//用户信息
    fs.mkdirSync("./cloudData/")//云数据
}

var welcomeMsg = [
    '-----------------------------',
    '| SteveScratch 云数据服务器 |',
    '|           DEMO版          |',
    '|      Made By SteveXMH     |',
    '-----------------------------',
    ''
]

for (var i = 0; i < welcomeMsg.length; i++) {
    console.log(welcomeMsg[i]);
};




//console.log("服务器已用内存：" + process.memoryUsage().external.toString() + "字节");
function serverFun(req, res) {

    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end("你想干嘛呢？\n你个肮脏的小骇客~\n                 ——SteveAns");
    return;
}

var hostServer = net.createServer(ssServer.socketServer)
hostServer.listen(config.config.port);
//http.createServer(serverFun).listen(port);

console.log("端口：" + config.config.port + " 已开放");
console.log("输入 stop 指令关闭服务器");

process.stdin.setEncoding('utf8');
process.stdin.on('readable', () => {
    var chunk = process.stdin.read();

    if (chunk !== null) {
        chunk = chunk.toString().substring(0, chunk.length - 2);
        //console.log(chunk.length)
        if (chunk == "stop") {
            console.log("正在关闭服务器！");
            ssServer.boardcastClients(JSON.stringify({ cmd: "serverClosed" }));
            hostServer.close();
            process.exit(0);
        } else {
            ssServer.runCommand(chunk);
        }

    }
});