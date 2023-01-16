import express from 'express';
import ApiRouter from './apis';
import configs from './config';
var app=express();
app.use('/api',ApiRouter);
const cors = require('cors');
app.use(cors({
    origin:['http://localhost:'+configs.port],
    methods:['GET','POST'],
}));
app.all('*',function (_req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:'+configs.port);
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    next();
});
app.listen(Number(configs.port),()=>{
    console.log("listen ok");
})