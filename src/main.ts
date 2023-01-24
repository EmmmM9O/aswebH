import express from 'express';
import ApiRouter from './apis';
import configs from './config';
import user from './Apis/user';
import map from './Apis/map';
import robot from './Apis/robot'
import bodyParser from 'body-parser';
import file from './IO/file';
file.mkdirI('maps');
var app=express();
const cors = require('cors');
app.use(cors({
    origin:['http://localhost:'+configs.port],
    methods:['GET','POST'],
}));
app.use('/api',bodyParser.json());// 添加json解析
app.use('/api',bodyParser.urlencoded({extended: false}));
app.all('*',function (_req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:'+configs.port);
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    next();
});
app.use('/api',ApiRouter);
app.use('/api/user',user);
app.use('/api/map',map);
app.use('/api/robot',robot);
app.use(express.static('public'));
app.get('/',(_req,res)=>{
    res.sendFile('../public/index.html')
})
app.listen(Number(configs.port),()=>{
    console.log("listen ok");
})


