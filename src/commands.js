const myUtil = require('./myUtil')
const fs = require('fs')
const os = require('os')

// 在此处输入帮助信息
// 数组用于多行文字
var helps = {
    help: [
        'help (指令名称)',
        '显示帮助信息'
    ],
    kick: [
        'kick (用户名或ip地址)',
        '将正在连接或已登录的用户强行断开连接',
        '例如：kick ::::192.168.0.110'
    ],
    ban: [
        'ban (用户名或ip地址) [封禁理由]',
        '将用户或者正在登录的客户端所登录的用户封禁',
        '如果是正在连接的客户端则会强制断开',
        '以后用户企图登录时将会返回封禁理由',
        '如果需要解封用户，请输入 unban 指令',
        '例如：ban John_Doe You have been baned.'
    ],
    unban: [
        'unban (用户名)',
        '将用户解除封禁',
        '此时用户将可以继续登录使用云数据',
        '如果需要封禁用户，请输入 ban 指令',
        '例如：unban John_Doe'
    ],
    setValue: [
        'setValue (用户名) (键值) [需要设置的值(可带空格)]',
        '设置指定用户变量中的值',
        '注意：名称不能含有空格和文件夹非法字符！',
        '例如：setValue John_Doe key value'
    ],
    setVP: [
        'setValue (用户名) (键值) (权限值)',
        '设置指定用户键的读写权限',
        '注意：名称不能含有空格和文件夹非法字符！',
        '      且权限值必须为 0-3 之间的整数！',
        '例如：setVP John_Doe key 0'
    ],
    info: [
        'info',
        '输出服务器状态信息'
    ],
    stop: [
        'stop',
        '断开客户端的连接并停止运行服务器'
    ]
}

// 你可以加入自己的质量
// 一定要保证有两个参数
// 一个是传入的所有参数
// 一个是当前的服务器对象
exports.commands = {
    help: (args, server) => {
        var cmdName = args[0]
        if (cmdName) {
            if (helps[cmdName] !== undefined) {
                if (typeof helps[cmdName] === 'string') {
                    myUtil.log(helps[cmdName])
                } else { // 默认为数组
                    for (var i = 0; i < helps[cmdName].length; i++) {
                        myUtil.log(helps[cmdName][i])
                    }
                }
            } else {
                myUtil.log('没有关于 ' + cmdName + ' 的帮助信息')
            }
        } else { // 输出所有指令第一行的帮助
            myUtil.log('帮助指令表：')
            myUtil.log('输入 help (指令名称) 来查询指定指令的详细帮助说明\n')
            for (var k in helps) {
                if (typeof helps[k] === 'string') {
                    myUtil.log(helps[k])
                } else {
                    myUtil.log(helps[k][0])
                }
            }
        }
    },
    kick: (args, server) => {
        var id = args[0]// 用户名称或ip地址
        var users = server.users
        var logininUsers = server.logininUsers
        for (var socket in users) {
            if (users[socket].address().address === id) {
                users[socket].end(JSON.stringify({ cmd: 'kicked' }))
                users[socket].destory()
                return myUtil.log('已强行断开客户端：' + id)
            }
        }
        if (logininUsers[id]) {
            logininUsers[id].end(JSON.stringify({ cmd: 'kicked' }))
            logininUsers[id].destory()
            return myUtil.log('已强行断开用户：' + id)
        }
    },

    setValue: (args, server) => {
        var nameSpace = args[0]
        var key = args[1]

        var counter = 3
        var value = args[2]
        if (value) {
            while (args[counter] !== undefined) {
                value = value + ' ' + args[counter]
                counter++
            }
        }
        if (!nameSpace || nameSpace.search('[\\/:*?<>|"]') !== -1) {
            myUtil.error('错误：未输入正确的用户名')
            return
        }
        if (!key) {
            myUtil.error('错误：未输入正确的键值')
            return
        }
        var oldValue = server.getDataValue(nameSpace, key)
        server.setDataValue(nameSpace, key, value)
        myUtil.log('修改了用户 ' + nameSpace + ' 中 ' + key + ' 存储的键值为 ' + value)
        myUtil.log('原旧值为：' + oldValue)
    },

    setVP: (args, server) => {
        var nameSpace = args[0]
        var key = args[1]
        var value = args[2]

        if (!nameSpace || nameSpace.search('[\\/:*?<>|" ]') !== -1) {
            myUtil.error('错误：未输入正确的用户名')
            return
        }
        if (!key) {
            myUtil.error('错误：未输入正确的键值')
            return
        }
        if (value > 3 || value < 0) {
            myUtil.error('错误：未输入正确的权限值')
            return
        }
        var oldValue = server.getDataPermission(nameSpace, key)
        server.setDataPermission(nameSpace, key, value)
        myUtil.log('修改了用户 ' + nameSpace + ' 中 ' + key + ' 的权限值为 ' + value)
        myUtil.log('原旧权限值为：' + oldValue)
    },

    info: (args, server) => {
        myUtil.log('服务器运行状态')
        myUtil.log('服务器已运行时长：' + process.uptime() + '秒')
        myUtil.log('当前已用内存：' + myUtil.formatSize(process.memoryUsage().rss))
        myUtil.log('系统剩余内存：' + myUtil.formatSize(os.freemem()))
        myUtil.log('正在连接的客户端数量：' + server.users.length)
        myUtil.log('已登录的用户数量：' + server.logininUsers.length)

        if (args[0] === 'fs') {
            myUtil.log('正在计算文件大小……')
            myUtil.log('用户信息文件大小：' + myUtil.formatSize(myUtil.getFileSize('./users')))
            myUtil.log('用户云数据文件大小：' + myUtil.formatSize(myUtil.getFileSize('./cloudData')))
        } else {
            myUtil.log('输入 info fs 查看用户数据大小统计信息（略耗时！）')
        }
    },

    ban: (args, server) => {
        var user = args[0]
        var counter = 2
        var value = args[1]
        if (value) {
            while (args[counter] !== undefined) {
                value = value + ' ' + args[counter]
                counter++
            }
        }
        if (!user || user.search('[\\/:*?<>|"]') !== -1) {
            myUtil.error('错误：未输入正确的用户名')
            return
        }
        if (fs.existsSync('./users/' + user + '.json')) {
            var userData
            try {
                userData = JSON.parse(fs.readFileSync('./users/' + user + '.json'))
                userData.baned = true
                userData.banedReason = value
                fs.writeFileSync('./users/' + user + '.json', JSON.stringify(userData))
                myUtil.log('已封禁用户 ' + user)

                var logininUsers = server.logininUsers
                if (logininUsers[user]) {
                    logininUsers[user].end(JSON.stringify({ cmd: 'baned', reason: value }))
                    logininUsers[user].destory()
                }
            } catch (err) {
                myUtil.error('错误：用户资料解析失败：' + err)
            };
        } else {
            return myUtil.error('错误：用户不存在')
        }
    },

    unban: (args, server) => {
        var user = args[0]
        var counter = 2
        var value = args[1]
        if (value) {
            while (args[counter] !== undefined) {
                value = value + ' ' + args[counter]
                counter++
            }
        }
        if (!user || user.search('[\\/:*?<>|"]') !== -1) {
            myUtil.error('错误：未输入正确的用户名')
            return
        }
        if (fs.existsSync('./users/' + user + '.json')) {
            var userData
            try {
                userData = JSON.parse(fs.readFileSync('./users/' + user + '.json'))
                userData.baned = false
                userData.banedReason = undefined
                fs.writeFileSync('./users/' + user + '.json', JSON.stringify(userData))
                myUtil.log('已解封用户 ' + user)
            } catch (err) {
                myUtil.error('错误：用户资料解析失败：' + err)
            };
        } else {
            return myUtil.error('错误：用户不存在')
        }
    }
}
