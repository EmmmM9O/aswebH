import express from 'express';
import ApiRouter from './apis';
import configs from './config';
import user from './Apis/user'
import bodyParser from 'body-parser';
var app=express();
const cors = require('cors');
app.use(cors({
    origin:['http://localhost:'+configs.port],
    methods:['GET','POST'],
}));
app.use(bodyParser.json());// 添加json解析
app.use(bodyParser.urlencoded({extended: false}));
app.all('*',function (_req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:'+configs.port);
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    next();
});
app.use('/api',ApiRouter);
app.use('/api/user',user);
app.use(express.static('public'));
app.get('/',(_req,res)=>{
    res.sendFile('../public/index.html')
})
app.listen(Number(configs.port),()=>{
    console.log("listen ok");
})
