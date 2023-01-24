import {exec} from 'child_process'
import jwt from 'jsonwebtoken';
import express from 'express';
import configs from '../config';
import fs from 'fs';
/*
exec("python3 main.py", (_err, stdout, _stderr) => {
  console.log(stdout)
});
*/
const router=express.Router();
router.post('/getVccode',(req,res):any=>{
    let lock=req.body.lock;
    if(!lock){
        return res.send({state:0,error:"错误的lock"});
    }
    let Jresu=jwt.sign({
        time:new Date().getTime(),
        lock:lock,
        state:'验证中'
    },configs.jwtSecretKey,{
        expiresIn: '5m'
    });
    exec("python "+configs.path+'/src/IO/vccode.py ', (err, stdout, stderr) => {
        if(err) console.error(err);
        if(stderr) console.error(stderr)
        let vc=stdout.substring(0,4);
        console.log(stdout);
        fs.rename('/tmp/asweb/vccode-'+vc+'.png','/tmp/asweb/vccode-'+Jresu+'.png',function(err):any{
            if(err){
                console.log(err);
                return res.send({state:0,error:err});
            }
            fs.writeFileSync('/tmp/asweb/vccode-'+Jresu+'.txt',vc);
            return res.send({state:1,result:Jresu});
        })
    })
});
router.get('/getPngV/:token',(req,res):any=>{
    let token=req.params.token;
    if(token==null||typeof token!='string'){
        return res.send({state:0,error:'你token呢'});
    }
    try{
        let k=jwt.verify(token,configs.jwtSecretKey);
        if(!k){
            return res.send({'state':-1,'erron':'已过期'});
        }
        if(typeof k=='string'){
            return res.send({'state':0,'erron':'类型错误'});
        }
        if(fs.existsSync('/tmp/asweb/vccode-'+token+'.png')){
            res.sendFile('/tmp/asweb/vccode-'+token+'.png');
        }else{
            res.send({'state':0,'erron':'不存在的token'});
        }
    }catch(e){
        console.error(e);
        return res.send({state:0,error:e});
    }
})
router.post('/checkVccode',(req,res):any=>{
    let token=req.body.token;let vccode=req.body.vccode;
    if(token==null||typeof token!='string'||vccode==null||typeof vccode!='string'){
        return res.send({state:0,error:'你token呢'});
    }
    try{
        let k=jwt.verify(token,configs.jwtSecretKey);
        if(!k){
            return res.send({'state':-1,'erron':'已过期'});
        }
        if(typeof k=='string'){
            return res.send({'state':0,'erron':'类型错误'});
        }
        if(fs.existsSync('/tmp/asweb/vccode-'+token+'.txt')){
            let vc=fs.readFileSync('/tmp/asweb/vccode-'+token+'.txt').toString();
            if(vc!=vccode){
                return res.send({'state':0,'erron':'验证码错误'});
            }
            let j=jwt.sign({
                state:'验证通过'
            },configs.jwtSecretKey,{
                expiresIn:'10m'
            });
            fs.unlinkSync('/tmp/asweb/vccode-'+token+'.png');
            fs.unlinkSync('/tmp/asweb/vccode-'+token+'.txt');
            return res.send({state:1,result:j});
        }else{
            res.send({'state':0,'erron':'不存在的token'});
        }
    }catch(e){
        console.error(e);
        return res.send({state:0,error:e});
    }
})
export default router;