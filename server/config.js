/**
 * config.js
 * 这里是配置设置文件
 * 你可以修改这里的值来自定义你的云数据服务器
 */

exports.config = {

    port: 8081,//服务器端口
    maxValue: 10,//每个用户允许的变量数量
    maxDataSize: 16 * 1024 * 1024,//每月登录用户最大限制流量（字节为单位）（0为无限制）
    maxGlobalDataSize: 1024 * 1024 * 1024,//每月全局最大限制流量（字节为单位）（0为无限制）（如果比 maxDataSize 小则优先 maxDataSize 的值）
    minAccLen: 6,//用户名最小长度
    minPassLen: 8,//密码最小长度

    /**
     * 检测所取键值是否符合标准
     * 你可以修改该程序来实现你的标准
     * value 为输入的值
     * 返回 true 则符合规则，反之亦然
     */
    verifyValue: function (value) {
        switch (typeof value) {
            case "boolean":
                return true;
            case "number":
                return true;
            case "string":
                if (value.length <= 65536) {
                    return true;
                } else {
                    return false;
                }
            default:
                return false;
        }
    }
}
/**
 * 此处为服务器所需要的信息，如果不是二次开发切勿修改！
 */
const serverInfo = {
    version: "ALPHA"
}
exports.serverInfo = serverInfo
