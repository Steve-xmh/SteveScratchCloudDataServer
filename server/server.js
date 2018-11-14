const config = require("./config")
const commands = require("./commands")
const minAccLen = config.config.minAccLen //用户名最小长度
const minPassLen = config.config.minPassLen//密码最小长度

/**
 * 执行服务器指令
 */
exports.runCommand = function (command) {
    var args = command.split(" ");
    if (args.length == 0){
        return
    }
    var cmd = args[0];
    if (commands.commands[cmd] != undefined) {
        args.shift();
        commands.commands[cmd](args,this)
        return
    } else {
        console.log("未知的指令：" + command);
    }
}

/**
 * 广播所有客户端
 * @param msg 要发送的信息，最好是JSON字符串
 * @param boardcastAll 是否广播未登录的用户，否则只广播已登陆的用户
 */
exports.boardcastClients = function (msg, boardcastAll) {
    if (boardcastAll) {
        for (var user in users) {
            users[user].write(msg);
        }
    } else {
        for (var user in logininUsers) {
            logininUsers[user].write(msg);
        }
    }

}

var fs = require("fs");
var users = [];//正在连接的Socket客户端
var logininUsers = {};//每个用户所在的Socket客户端

exports.users = users;
exports.logininUsers = logininUsers;

/**
 * 云数据连接
 */
exports.socketServer = function (socket) {
    var address = socket.address().address + ":" + socket.address().port;
    console.log("连接到新客户端：" + address);

    users.push(socket);

    socket.on('data', function (data) {
        //console.log("接收到信息！");
        console.log("[信息接收]用户：" + address);
        //console.log("数据：" + data);
        try {
            var dataJSON = JSON.parse(data);
        } catch (err) {
            console.error("[信息接收]解析数据时发生错误：" + err);
            console.error("[消息接收]原消息为：" + data);
            console.error("[信息接收]此消息未被识别！");
            return;
        }

        switch (dataJSON.cmd) {
            case "login"://登录操作
                if (dataJSON.acc == "" || dataJSON.acc == undefined || dataJSON.pass == undefined || dataJSON.pass == "") {
                    return socket.write(JSON.stringify({ cmd: "login", suc: 1 }))//输入正确的账户名或密码
                }
                if (!fs.existsSync("./users/" + dataJSON.acc + ".json")) {
                    return socket.write(JSON.stringify({ cmd: "login", suc: 2 }))//账户不存在
                }
                var pass = fs.readFileSync("./users/" + dataJSON.acc + ".json");
                if (pass == dataJSON.pass) {
                    //登录成功
                    if (logininUsers[dataJSON.acc] != undefined) {
                        return socket.write(JSON.stringify({ cmd: "login", suc: 4 }))//已经登录
                    }
                    logininUsers[dataJSON.acc] = address
                    console.log("[用户系统]客户端登录了账户：" + dataJSON.acc);
                    return socket.write(JSON.stringify({ cmd: "login", suc: 0 }))//登陆成功
                } else {
                    console.log("")
                    return socket.write(JSON.stringify({ cmd: "login", suc: 3 }))//密码错误
                }
            case "register"://注册
                if (dataJSON.acc == "" || dataJSON.acc == undefined || dataJSON.pass == undefined || dataJSON.pass == "") {
                    return socket.write(JSON.stringify({ cmd: "register", suc: 1 }))//输入正确的账户名或密码
                }
                if (dataJSON.acc.length < minAccLen || dataJSON.pass.length < minPassLen) {
                    return socket.write(JSON.stringify({ cmd: "register", suc: 2 }))//用户名或密码过于简单
                }
                if (dataJSON.acc.search("[\\\/\:\*\?\<\>\|\"]") != -1) {
                    return socket.write(JSON.stringify({ cmd: "register", suc: 3 }))//用户名不合法（有非法字符）
                }
                if (fs.existsSync("./users/" + dataJSON.acc + ".json")) {
                    return socket.write(JSON.stringify({ cmd: "register", suc: 4 }))//账户已存在
                }

                var logData = {
                    pass: dataJSON.pass,
                    baned: false,
                    banedReason : "",
                    regTime: new Date().toJSON()
                }

                fs.writeFileSync("./users/" + dataJSON.acc + ".json", JSON.stringify(logData));
                console.log("[用户系统]客户端注册了账户：" + dataJSON.acc);
                return socket.write(JSON.stringify({ cmd: "register", suc: 0 }));//注册成功
            case "getValues"://请求获取云数据

            case "setValue"://请求设置云数据

            default:
                console.log("[信息接收]接收了未知的指令：" + dataJSON.cmd);
        }
    })

    socket.on('end', function () {
        console.log("客户端断开连接：" + address);
        users.splice(users.indexOf(socket));
    })

    socket.on('close', function (hasErr) {
        if (hasErr) {
            console.log("[注意]客户端意外的断开了连接：" + address);
        } else {
            console.log("客户端断开连接：" + address);
        }

        users.splice(users.indexOf(socket));
        for (u in logininUsers) {
            if (logininUsers[u] == address) {
                logininUsers[u] = undefined
                break
            }
        }
    })

    socket.on('error', function (err) {

        console.log("[注意]客户端意外的断开了连接：" + address);
        console.log("[注意]错误信息：" + err);

        users.splice(users.indexOf(socket));
        for (u in logininUsers) {
            if (logininUsers[u] == address) {
                logininUsers[u] = undefined
                break
            }
        }

    })

    socket.write("requireLogin");
    console.log("已请求客户端进行登录！");

};