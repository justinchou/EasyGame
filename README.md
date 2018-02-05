轻量游戏服务器
===


**关于日志的记录说明**

配置文件: `config/log4js.json`

appenders用于标记日志的存储地址, 以及切割方式, 建议默认以 yyyy-MM-dd-HH 按小时切割.

categories用于标记使用哪个/哪一些appenders进行日志的记录, 并且设置记录的日志等级.

0. default: 默认分类
1. mocha: 所有test中的自动测试脚本的内容使用此类型
2. system: 所有bin中的启动脚本的内容使用此类型
3. sql: 所有model中的日志使用此类型, 一般记录sql语句以及sql的返回值之类
4. statistics: 记录一些统计需要的数据, 新增/日活/留存..., 服务器的状态/资源使用情况...
5. utils: 所有的zutils项目中的 集合逻辑日志, 类方法日志等
6. account: 所有zaccount项目中的 访问日志, 执行逻辑日志等
7. website: 所有zwebsite项目中的 访问日志, 执行逻辑日志等

**关于日志制动备份**

参考另一个开源项目: https://gitee.com/justinchou/LogCompress


