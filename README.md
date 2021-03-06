轻量游戏服务器
===

**关于本游戏框架**

本框架基于NodeJS + MySQL实现房间回合制游戏的实时对战交互功能, 实现平台化数据共享.

运维框架将在逐步完善过程中, 思路是Http短连接使用Nginx进行外部代理, 长连接游戏服务/短连接的UDP通信直接面向游戏客户端.

(当然如果是不支持udp的客户端也可以使用tcp替代之,尽管有些情况下推荐使用udp). 



**游戏框架内代码的基本组织格式**

代码格式定义: 

__使用const的情况__

1. 所有系统包, 第三方包引入均使用 `const Xxx = require(‘xxx’);` 形式, `const + 首字母大写 + 单引号引入包名`;
2. 配置文件, `log4js`日志分类, 本地自己编写的包文件, 引入均以第三方包引入格式一致.

__文件内包引入顺序__

`系统包` > `第三方包` > `自编写的包` > `配置文件` > `第三方包配置` > `自编写的包配置` > `文本中全局let变量` > `函数/功能/代码等` > `modele.exports`

__日常编码习惯__

文件命名: 类文件已首字母大写的驼峰命令, 普通文件以首字母小写的驼峰命名.

声明方法: 所有类文件引入代码以后, 均以const进行声明, 变量名同类名; 所有普通文件引入后, 均以let进行声明, 变量名以首字母小写的驼峰命名.

通信变量: 所有与客户端通信的参数均以首字母小写的驼峰变量命名, 第三方的api需要必须以 `_` 命名的除外

全部文件均以 `'use strict'` 为基础, `let`/`const` 进行变量/常量的声明.

字符串拼接一般不采取 `+` 而是使用 `Util.format('%s %j', str, json)` 的方式.

类Function/功能function的定义: 凡是需要使用 new 生成对象的类Function要首字母大写, 其余功能function首字母不能大写, 其中类Function的方法(功能function)也同样不能首字母大写


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


