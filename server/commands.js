//在此处输入帮助信息
//数组用于多行文字
var helps = {
    help: [
        "help (指令名称)",
        "显示帮助信息",
    ],
    kick: [
        "kick (用户名或ip地址)",
        "将正在连接或已登录的用户强行断开连接"
    ]
}

//你可以加入自己的质量
//一定要保证有两个参数
//一个是传入的所有参数
//一个是当前的服务器对象
exports.commands = {
    help: function (args, server) {
        var cmdName = args[0]
        if (helps[cmdName] != undefined)
        {
            if (typeof helps[cmdName] == "string")
            {
                console.log(helps[cmdName])
            }else{//默认为数组
                for (var i=0;i<helps[cmdName].length;i++)
                {
                    console.log(helps[cmdName][i])
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
    }
}