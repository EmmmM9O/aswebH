# AS地图站 后端
## 开始
* ### 从[ASWeb](https://github.com/EmmmM9O/asweb)下载前端编译后文件 改名public并入
* ### 配置MySql
```
CREATE TABLE IF NOT EXISTS `user`(
  `email` VARCHAR(100) NOT NULL,
   `name` VARCHAR(100) NOT NULL,   
   `password` VARCHAR(40) NOT NULL,   
   PRIMARY KEY ( `email` )
   )ENGINE=InnoDB DEFAULT CHARSET=utf8;
```
* ### 配置config.ts 
* ### 运行
```
yarn install
yarn run dev --port=xxx
```
