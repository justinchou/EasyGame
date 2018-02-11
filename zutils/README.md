# Utils 工程文档

## 简介

本项目是其他项目的公用类, 一般不做单独的项目启动, 只被其他项目引用.



## 文件内容说明


**classes文件夹**

存储必须需要使用new函数进行初始化的类, 或者通过getInstance获取的单利.

__**HttpResponser**__ 

向客户端返回数据的类, 数据均采用此格式进行通信.

    let data = new HttpResponser().fill(errCode, {"message": "", otherdata: xxx}, [attach], {stack: xxx});
    res.send(data.encode());
    
通过`new HttpResponser()`创建类, 然后通过`fill()`填充数据.

发送数据时, 采用`encode()`进行加密, 向数据请求方发送数据.

__**Singleton**__

项目中的数据单利, 为了在整个项目中进行数据的保持, 以及数据的定时存储/获取等, 在统一位置进行数据的管理, 在项目中任何位置进行数据操作:

    let DataIns = require('./classes/Singleton').getInstance();
    DataIns.set(key, value);
    DataIns.get(key);
    
目前此单例模式仅做数据存储, 将来还会扩展到自动向数据落地持久化功能, 第三方内存管理以便多进程间可以通信等等.



**model文件夹**

存储所有对数据库的数据表进行操作的model类, 其中每个数据表(非数据库)保持一个单独连接池, 使用单独的用户名密码进行数据操作


**sqls文件夹**

将MYSQL的数据表结构的创建生成sql文件存储, 其中sqls文件夹下的文件夹名, 为数据库的库名, 对应数据库文件夹下的文件为数据表名.


**test文件夹**

对本项目的所有代码进行BDD测试


**utils文件夹**

一些常用的方法集合, 第三方sdk的接入包, 等等可共用的方法, 而不是需要new才能使用的类, 存放在此处.
