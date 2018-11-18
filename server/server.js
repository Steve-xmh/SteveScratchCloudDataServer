const config = require("./config")
const commands = require("./commands")
const minAccLen = config.config.minAccLen //用户名最小长度
const minPassLen = config.config.minPassLen//密码最小长度

var fs = require("fs");
var users = [];//正在连接的Socket客户端
var logininUsers = {};//每个用户所在的Socket客户端
var globalDataSize = 0;

exports.users = users;
exports.logininUsers = logininUsers;
exports.lastGlobalDataSize = 0;

exports.getCurGlobalDataSize = function () { return globalDataSize };

function formatSize(size, useLitePower) {
	var sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB", "BB", "NB", "DB"];
	var unit = 0;
	var power = useLitePower ? 1000 : 1024;
	while (size > power && unit < sizes.length)
	{
		unit++;
		size = size / power
	}
	return size.toFixed(2) + sizes[unit];
}
/*
  if not options.h then
    return tostring(size)
  elseif type(size) == "string" then
    return size
  end
  local sizes = {"", "K", "M", "G"}
  local unit = 1
  local power = options.si and 1000 or 1024
  while size > power and unit < #sizes do
    unit = unit + 1
    size = size / power
  end
  return math.floor(size * 10) / 10 .. sizes[unit]
end
*/

/**
 * 广播所有客户端
 * @param msg 要发送的信息，最好是JSON字符串
 * @param boardcastAll 是否广播未登录的用户，否则只广播已登陆的用户
 */
exports.boardcastClients = function (msg, boardcastAll) {
	if (boardcastAll) {
		for (var i = 0; i < users.length; i++) {
			users[i].write(msg);
		}
	} else {
		for (var user in logininUsers) {
			logininUsers[user].write(msg);
		}
	}

}

/**
 * 执行服务器指令
 */
exports.runCommand = function (command) {
	var args = command.split(" ");
	if (args.length == 0) {
		return
	}
	var cmd = args[0];
	if (commands.commands[cmd] != undefined) {
		args.shift();
		commands.commands[cmd](args, this)
		return
	} else {
		console.log("未知的指令：" + command);
	}
}

/**
 * 设置/获取用户区域中的值
 * 将会调用 config.js 中的 verifyValue 函数检测是否符合规定后再加入；
 * 符合规定的话将会设置所指键值为所给值，并计入流量中；
 * 如果不合规定则不会变动任何内容，但是将会计入流量中。
 * @param {用户名称} user 用户名称
 * @param {键值} key 值将会存储在的键名称
 * @param {欲设置的数据} data 如果需要获取原值请设置成 undefined
 */
/*
	权限说明：
	每个键值对应一个权限值，下表对应了每个数值所可用的权限
	当然，服务器管理员可以自由读写值和设置权限
	未登录访客将不会记录用户流量，但是会记录到全局流量！
	读：
	┌───────────┬───────┬───────────┬───────────────┐
	│对应值		│拥有者2│非拥有者1	│访客（未登录）0│
	├───────────┼───────┼───────────┼───────────────┤
	│0			│√		│√			│√				│
	├───────────┼───────┼───────────┼───────────────┤
	│1			│√		│√			│				│
	├───────────┼───────┼───────────┼───────────────┤
	│2			│√		│			│				│
	├───────────┼───────┼───────────┼───────────────┤
	│3			│		│			│				│//仅服务器管理员可以设置
	└───────────┴───────┴───────────┴───────────────┘
	写：
	┌───────────┬───────┬───────────┬───────────────┐
	│对应值		│拥有者2│非拥有者1	│访客（未登录）0│
	├───────────┼───────┼───────────┼───────────────┤
	│0			│√		│√			│√				│
	├───────────┼───────┼───────────┼───────────────┤
	│1			│√		│√			│				│
	├───────────┼───────┼───────────┼───────────────┤
	│2			│√		│			│				│
	├───────────┼───────┼───────────┼───────────────┤
	│3			│		│			│				│//仅服务器管理员可以设置
	└───────────┴───────┴───────────┴───────────────┘
*/
function setDataValue(user, key, data) {
	if (fs.existsSync("./cloudData/" + user + ".json")) {
		var newData = JSON.parse(fs.readFileSync("./cloudData/" + user + ".json"));
		newData.data[key] = data;
		fs.writeFileSync("./cloudData/" + user + ".json", JSON.stringify(newData));
	} else {
		var newData = {
			data: {
				key: data
			},//数据存储的地方
			permission: {
				key: 1
			}//权限清单，对应每个键值
		}
		fs.writeFileSync("./cloudData/" + user + ".json", JSON.stringify(newData));
	}
}

function getDataValue(user, key) {
	if (fs.existsSync("./cloudData/" + user + ".json")) {
		var newData = JSON.parse(fs.readFileSync("./cloudData/" + user + ".json"));
		return newData.data[key];
	} else {
		var newData = {
			data: {},//数据存储的地方
			permission: {}//权限清单，对应每个键值
		}
		fs.writeFileSync("./cloudData/" + user + ".json", JSON.stringify(newData));
		return undefined;
	}
}

function getDataPermission(user, key) {
	if (fs.existsSync("./cloudData/" + user + ".json")) {
		var newData = JSON.parse(fs.readFileSync("./cloudData/" + user + ".json"));
		return newData.permission[key] === undefined ? 0 : newData.permission[key];
	} else {
		var newData = {
			data: {},//数据存储的地方
			permission: {}//权限清单，对应每个键值
		}
		fs.writeFileSync("./cloudData/" + user + ".json", JSON.stringify(newData));
		return 1;
	}
}

function setDataPermission(user, key, newPermission) {
	if (fs.existsSync("./cloudData/" + user + ".json")) {
		var newData = JSON.parse(fs.readFileSync("./cloudData/" + user + ".json"));
		newData.permission[key] = newPermission;
		fs.writeFileSync("./cloudData/" + user + ".json", JSON.stringify(newData));
	} else {
		var newData = {
			data: {},//数据存储的地方
			permission: {}//权限清单，对应每个键值
		}
		newData.permission[key] = newPermission;
		fs.writeFileSync("./cloudData/" + user + ".json", JSON.stringify(newData));
	}
}

exports.setDataAndRecordValue = setDataValue;
exports.getDataAndRecordValue = getDataValue;
exports.getDataPermission = getDataPermission;
exports.setDataPermission = setDataPermission;

/**
 * 云数据连接
 */
exports.socketServer = function (socket) {
	var address = socket.address().address + ":" + socket.address().port;
	var lastDataSize = 0;
	var dataUsedSize = 0;
	var loginingUser = null;//登录的用户
	console.log("连接到新客户端：" + address);

	users.push(socket);

	function detectData() {
		//------------检测数据量
		var totalBytes = socket.bytesWritten;
		var addedByteSize = totalBytes - lastDataSize;

		if (totalBytes >= config.config.maxDataSize || dataUsedSize >= config.config.maxDataSize) {
			if (exports.lastGlobalDataSize + globalDataSize >= config.config.maxGlobalDataSize) {
				console.log("警告！当前数据传输量已超出定义水平！");
				console.log("当前全局已写出数据量：" + formatSize(globalDataSize));
				console.log("原定义标准写出数据量：" + formatSize(config.config.maxGlobalDataSize))
				console.log("已超出预定的 " + (globalDataSize / config.config.maxGlobalDataSize * 100).toFixed(2) + "%！")
				return false;//将拒绝回复信息
			}
			socket.write(JSON.stringify({ cmd: "outOfDataSize" }));
			return false;
		}

		dataUsedSize += addedByteSize;
		globalDataSize += addedByteSize;
		lastDataSize = totalBytes;
		return true;
		//
	};

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

		if (!detectData()) {
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
				var userInfo = JSON.parse(fs.readFileSync("./users/" + dataJSON.acc + ".json"));
				if (userInfo.pass == dataJSON.pass) {
					//登录成功
					if (logininUsers[dataJSON.acc] != undefined) {
						return socket.write(JSON.stringify({ cmd: "login", suc: 4 }))//已经登录
					}
					logininUsers[dataJSON.acc] = socket;
					loginingUser = dataJSON.acc;
					dataUsedSize = userInfo.dataUsedSize;
					console.log("[用户系统]客户端登录了账户：" + dataJSON.acc);
					return socket.write(JSON.stringify({ cmd: "login", suc: 0 }))//登陆成功
				} else {
					//console.log("[用户系统]用户企图登录账户失败：" + dataJSON.acc);
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
					banedReason: "",
					dataUsedSize: 0,
					regTime: new Date().getTime()
				}

				fs.writeFileSync("./users/" + dataJSON.acc + ".json", JSON.stringify(logData));
				console.log("[用户系统]客户端注册了账户：" + dataJSON.acc);
				return socket.write(JSON.stringify({ cmd: "register", suc: 0 }));//注册成功
			case "getValue"://请求获取云数据
				var nameSpace = dataJSON.ns;
				var key = dataJSON.key;
				var permission = 0
				if (loginingUser) {
					if (nameSpace == loginingUser) {
						permission = 2
					} else {
						permission = 1
					}
				}
				var keyP = getDataPermission(nameSpace, key);
				if (keyP <= permission) {
					return socket.write(JSON.stringify({ cmd: "getValues", stat: 0, value: getDataValue(nameSpace, key) }));
				} else {
					return socket.write(JSON.stringify({ cmd: "getValues", stat: 1 }));//权限不足
				}

			case "setValue"://请求设置云数据

				var nameSpace = dataJSON.ns;
				var key = dataJSON.key;
				var value = dataJSON.value;
				var permission = 0
				if (loginingUser) {
					if (nameSpace == loginingUser) {
						permission = 2
					} else {
						permission = 1
					}
				}
				var keyP = getDataPermission(nameSpace, key);



				if (keyP <= permission) {
					setDataValue(nameSpace, key, value);
					return socket.write(JSON.stringify({ cmd: "setValues", stat: 0 }));
				} else {
					return socket.write(JSON.stringify({ cmd: "setValues", stat: 1 }));//权限不足
				}

			case "setVP":
				var nameSpace = dataJSON.ns;
				var key = dataJSON.key;
				var newPermission = dataJSON.np;
				var permission = 0
				if (loginingUser) {
					if (nameSpace == loginingUser) {
						permission = 2
					} else {
						permission = 1
					}
				}
				var keyP = getDataPermission(nameSpace, key);
				if (keyP <= permission) {
					setDataPermission(nameSpace, key, newPermission);
					return socket.write(JSON.stringify({ cmd: "setVP", stat: 0 }));
				} else {
					return socket.write(JSON.stringify({ cmd: "setVP", stat: 1 }));//权限不足
				}
			case "hb":
				return socket.write(JSON.stringify({ cmd: "hb", stat: 0, ver: config.serverInfo.version }));//心跳包
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
		logininUsers[loginingUser] = undefined;

	})

	socket.on('error', function (err) {

		console.log("[注意]客户端意外的断开了连接：" + address);
		console.log("[注意]错误信息：" + err);

		users.splice(users.indexOf(socket));
		logininUsers[loginingUser] = undefined;

	})

	socket.write(JSON.stringify({ cmd: "requireLogin", ver: config.serverInfo.version }))
	console.log("已请求客户端进行登录！");

};
