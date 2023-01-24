# AS地图站 后端
## 介绍
* ### 由emmm开发
* ### 前端使用vue和element-plus
* ### 后端使用express框架和python(生成验证码)
* ### 数据库mysql
## 开始
* ### 环境:nodejs 19(最好) python3 mysql
* ### 从[ASWeb](https://github.com/EmmmM9O/asweb)下载前端后更改config.ts编译文件 改名public并入
* ### 配置MySql
```
Api/map.ts第一段注释
```
```
CREATE TABLE IF NOT EXISTS `user`(
  `email` VARCHAR(100) NOT NULL,
   `name` VARCHAR(100) NOT NULL,   
   `password` VARCHAR(40) NOT NULL,   
   PRIMARY KEY ( `email` )
   )ENGINE=InnoDB DEFAULT CHARSET=utf8;
```
* ### 配置config.ts 
* ### 新建src/QQEmail.ts配置邮箱 根据nodemailer
* ### 运行
```
yarn install
yarn run dev --port=xxx
```
