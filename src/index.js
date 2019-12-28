var fs = require('fs')// 文件系统
var net = require('net')
var myUtil = require('./myUtil')
var ssServer = require('./server')
const config = require('./config')

if (!fs.existsSync('./users/')) fs.mkdirSync('./users/')// 用户信息
if (!fs.existsSync('./cloudData/')) fs.mkdirSync('./cloudData/')// 云数据
// 29//27//13.5
var welcomeMsg = [
    '-----------------------------',
    '| SteveScratch 云数据服务器 |',
    '|' + (' ').repeat(Math.ceil(12.5 - config.serverInfo.version.length / 2)) + config.serverInfo.version + '版' + (' ').repeat(12.5 - config.serverInfo.version.length / 2) + '|',
    '|      Made By SteveXMH     |',
    '-----------------------------',
    ''
]

for (var i = 0; i < welcomeMsg.length; i++) {
    myUtil.log(welcomeMsg[i])
};

// myUtil.log("服务器已用内存：" + process.memoryUsage().external.toString() + "字节");
/*
function serverFun (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('你想干嘛呢？\n你个肮脏的小骇客~\n                 ——SteveAns')
}
*/

var lunchTime = new Date()
let serverStat
if (!fs.existsSync('./serverStat.json')) {
    fs.writeFileSync('./serverStat.json', JSON.stringify({
        mouth: lunchTime.getMonth(),
        globalDataSize: 0
    }))
} else {
    serverStat = JSON.parse(fs.readFileSync('./serverStat.json'))
    // 需要清零数据用量
    if (serverStat.mouth !== lunchTime.getMonth()) {
        myUtil.log('到了每月一次的数据用量清零时间！\n正在清零所有用户的数据用量...')
        var users = fs.readdirSync('./users/')
        for (var user in users) {
            var data = JSON.parse(fs.readFileSync('./users/' + users[user]))
            myUtil.log(users[user] + ': 已用数据量：' + data.dataUsedSize + ' 字节 (' + ((data.dataUsedSize === undefined ? 0 : data.dataUsedSize) / config.config.maxDataSize) + '%)')
            data.dataUsedSize = 0
            fs.writeFileSync('./users/' + users[user], JSON.stringify(data))
        }
        serverStat.mouth = lunchTime.getMonth()
        serverStat.globalDataSize = 0
        fs.writeFileSync('./serverStat.json', JSON.stringify(serverStat))
        myUtil.log('清零完毕！继续启动服务器！')
    }
}

serverStat = JSON.parse(fs.readFileSync('./serverStat.json'))

if (serverStat.globalDataSize) {
    ssServer.lastGlobalDataSize = serverStat.globalDataSize
}

serverStat = undefined

var hostServer = net.createServer(ssServer.socketServer)
hostServer.listen(config.config.port)
// http.createServer(serverFun).listen(port);

myUtil.log('IP：' + hostServer.address().address + ':' + config.config.port + ' 已开放')
myUtil.log('输入 stop 指令关闭服务器')

process.stdin.setEncoding('utf8')
process.stdin.on('readable', () => {
    var chunk = process.stdin.read()

    if (chunk !== null) {
        chunk = chunk.toString().replace(/[\r\n]/g, '')
        // myUtil.log(chunk.length)
        if (chunk === 'stop') {
            myUtil.warn('正在关闭服务器！')
            ssServer.boardcastClients(JSON.stringify({ cmd: 'serverClosed' }), true)

            var usedSize = ssServer.getCurGlobalDataSize() + ssServer.lastGlobalDataSize
            var serverStat = JSON.parse(fs.readFileSync('./serverStat.json'))
            serverStat.globalDataSize = usedSize
            fs.writeFileSync('./serverStat.json', JSON.stringify(serverStat))
            hostServer.close()
            process.exit(0)
        } else {
            ssServer.runCommand(chunk)
        }
    }
    process.stdin.resume()
})
