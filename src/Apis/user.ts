import express from 'express';
import mysql from 'mysql'
import configs from '../config'
import sqlstring from 'sqlstring'
import  jwt from 'jsonwebtoken';
import mail from '../IO/mail';
interface tcs{
    [index:string]:string
}
var vccodes:tcs={};
const passwordReg=configs.passwordReg;
const router=express.Router();
function connect(){
    return mysql.createConnection(configs.MySqlConfig);
}
router.post('/login',(req,res)=>{
    try{
        let name=req.body.name;
        let password=req.body.password;
        if(typeof name!=='string'||typeof password!=='string'){
            res.send('Erron name or password type');
            console.error(`from${req.query.name} type erron`);
            return;
        }
        if(!passwordReg.test(password)){
            res.send('Erron Password is not alow');
            return;
        }
        name=sqlstring.escape(name);
        password=sqlstring.escape(password);
        let sqlC='select * from user where name like ' + name + ' and password like '+password;
        let sql=connect();
        sql.connect();
        sql.query(sqlC,(err,result)=>{
            if(err){
                res.send('erron MySql '+err);
                return;
            }
            let k=eval(result);
            if(k.length<=0){
                res.send({
                    'state':0,
                    'token':'',
                    'result':'No Such User'
                })
                return ;
            }
            var tokenStr = jwt.sign(k[0], configs.jwtSecretKey, {
                expiresIn: '10h',
            })
            res.send({
                'state':1,
                'token':tokenStr,
                'result':result
            });
        });
    }catch(e){
        res.send('Erron:'+e)
    }
});
router.post('/signup',(req,res)=>{
    let emai=req.body.mail;
    let name=req.body.name;
    let password =req.body.password;
    if(typeof emai!=='string'||typeof name!=='string' || typeof password!=='string'){
        res.send("erron type");
        return ;
    }
    if(!configs.mailReg.test(emai)){
        res.send('erron email is not aolw');
        return ;
    }
    if(!passwordReg.test(password)){
        res.send('erron password is not alow')
    }
    var sql=connect();
    sql.connect();
    let semai=sqlstring.escape(emai);
    var sqlS='select * from user where email like '+semai;
    //check email
    sql.query(sqlS,(err,result)=>{
        if(err){
            res.send('erron sql '+err);
            return ;
        }
        try{
            let o=eval(result);
            if(typeof o!==typeof []){
                res.send('erron result type');
                return ;
            }
            if(o.length<=0){
                /* send vccode to email */
                let vccde:string=String(Math.floor(Math.random()*10000));
                console.log(`send ${vccde} to ${emai}`)
                mail.transporter.sendMail({
                    from:'2124363741@qq.com',
                    subject:'AS地图站 验证码',
                    to:emai,
                    text:'你的验证码是'+vccde+'若非本人操作 请忽略 有效期5分钟'
                },(err,_info)=>{
                    if(err){
                        res.status(402).send(err);
                        return ;
                    }
                });
                let resu={
                    name:name,
                    password:password,
                    mail:emai,
                    date:new Date().getTime()
                }
                let Jresu=jwt.sign(resu,configs.jwtSecretKey,{
                    expiresIn: '5m'
                });
                vccodes[Jresu]=vccde;
                res.send(
                    {
                        token:Jresu
                    }
                )
                return;
            }else{
                res.send('has an email');
            }
        }catch(e){
            res.send('erron on:'+e);
            return ;
        }
    });

});
router.post('/vccode',(req,res)=>{
    let token=req.body.token;
    if(typeof token!=='string'){
        res.status(101).send('erron type on '+typeof token);
    }
    try{
        let k=jwt.verify(token,configs.jwtSecretKey);
        if(!k){
            res.status(401).send('过期');
        }
        if(typeof k==='string'){
            res.status(402).send('jwt异常');
            return;
        }
        if(!k.vccode|| typeof k.vccode !='string'){
            res.send('err vccode type');
            return;
        }
        if(k.vccode!=vccodes[token]){
            res.send('erron vccode is not same');
        }
        let emai=k.mail;
        let name=k.name
        let password=k.password;
        if(typeof emai!=='string'||typeof name!=='string'||typeof password!=='string'){
            res.send('err type'+typeof emai+'/'+typeof name+'/'+typeof password);
            return;
        }
        emai=sqlstring.escape(emai);
        name=sqlstring.escape(name);
        password=sqlstring.escape(password);
        let sqlS:string='insert into user (email,name,password) values ('+emai+','+name+','+password+')';
        let sql=connect();
        sql.connect();
        sql.query(sqlS,(err,_result)=>{
            if(err){
                res.send('erron sql:'+err);
                return;
            }
            res.send('ok');
        });
    }catch(e){
        res.status(401).send('过期:'+e)
        return ;
    }
})
export default router;