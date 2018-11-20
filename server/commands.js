const myUtil = require("./myUtil")

//在此处输入帮助信息
//数组用于多行文字
var helps = {
    help: [
        "help (指令名称)",
        "显示帮助信息",
    ],
    kick: [
        "kick (用户名或ip地址)",
        "将正在连接或已登录的用户强行断开连接",
        "例如：kick ::::192.168.0.110"
    ],
    setValue: [
        "setValue (用户名) (键值) [需要设置的值(可带空格)]",
        "设置指定用户变量中的值",
        "注意：名称不能含有空格和文件夹非法字符！",
        "例如：setValue John_Doe key value"
    ],
    setVP: [
        "setValue (用户名) (键值) (权限值)",
        "设置指定用户键的读写权限",
        "注意：名称不能含有空格和文件夹非法字符！",
        "      且权限值必须为 0-3 之间的整数！",
        "例如：setVP John_Doe key 0"
    ],
    info: [
        "info",
        "输出服务器状态信息"
    ]
}

//你可以加入自己的质量
//一定要保证有两个参数
//一个是传入的所有参数
//一个是当前的服务器对象
exports.commands = {
    help: function (args, server) {
        var cmdName = args[0]
        if (cmdName) {
            if (helps[cmdName] != undefined) {
                if (typeof helps[cmdName] == "string") {
                    myUtil.log(helps[cmdName])
                } else {//默认为数组
                    for (var i = 0; i < helps[cmdName].length; i++) {
                        myUtil.log(helps[cmdName][i])
                    }
                }
            } else {
                myUtil.log("没有关于 " + cmdName + " 的帮助信息")
            }
        } else {//输出所有指令第一行的帮助
            myUtil.log("帮助指令表：")
            myUtil.log("输入 help (指令名称) 来查询指定指令的详细帮助说明\n")
            for (var k in helps) {
                if (typeof helps[k] == "string") {
                    myUtil.log(helps[k])
                } else {
                    myUtil.log(helps[k][0])
                }
            }
        }

    },
    kick: function (args, server) {
        var id = args[0];//用户名称或ip地址
        var users = server.users;
        for (var socket in users) {
            if (users[socket].address().address == id) {
                users[socket].end(JSON.stringify({ cmd: "kicked" }));
                users[socket].destory();
            }
        }
    },

    setValue: function (args, server) {
        var nameSpace = args[0];
        var key = args[1];

        var counter = 3;
        var value = args[2];
        if (value) {
            while (args[counter] != undefined) {
                value = value + " " + args[counter]
                counter++
            }
        }
        if (!nameSpace || nameSpace.search("[\\\/\:\*\?\<\>\|\"]") != -1) {
            myUtil.error("错误：未输入正确的用户名");
            return
        }
        if (!key) {
            myUtil.error("错误：未输入正确的键值");
            return
        }
        var oldValue = server.getDataValue(nameSpace, key);
        server.setDataValue(nameSpace, key, value);
        myUtil.log("修改了用户 " + nameSpace + " 中 " + key + " 存储的键值为 " + value);
        myUtil.log("原旧值为：" + oldValue);
    },

    setVP: function (args, server) {
        var nameSpace = args[0];
        var key = args[1];
        var value = args[2];

        if (!nameSpace || nameSpace.search("[\\\/\:\*\?\<\>\|\"\ ]") != -1) {
            myUtil.error("错误：未输入正确的用户名");
            return
        }
        if (!key) {
            myUtil.error("错误：未输入正确的键值");
            return
        }
        if (value > 3 || value < 0) {
            myUtil.error("错误：未输入正确的权限值");
            return
        }
        var oldValue = server.getDataPermission(nameSpace, key);
        server.setDataPermission(nameSpace, key, value);
        myUtil.log("修改了用户 " + nameSpace + " 中 " + key + " 的权限值为 " + value);
        myUtil.log("原旧权限值为：" + oldValue);
    },

    info: function (args, server) {
        myUtil.log("暂时没有呢~")
    }
}
