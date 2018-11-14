//在此处输入帮助信息
//数组用于多行文字
var helps = {
    help: "显示帮助信息",
}

//你可以加入自己的质量
//一定要保证有两个参数
//一个是传入的所有参数
//一个是当前的服务器对象
exports.commands = {
    help: function (args, server) {
        console.log("并没有帮助 xd")
    },
    kick: function (args, server) {
        var id = args[0];//用户名称或ip地址
        var users = server.users;
        for (var socket in users) {
            if (users[socket].socket.address().address == id) {
                users[socket].end(JSON.stringify({ cmd: "kicked" }));
                users[socket].destory();
            }
        }
    }
}