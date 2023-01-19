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
            res.send({
                'state':0,
                'erron':"出现一个问题:名字或密码的类型不为字符串"
            });
            console.error(`from${req.query.name} type erron`);
            return;
        }
        if(!passwordReg.test(password)){
            res.send({
                'state':0,
                'erron':'违法的密码'
            })
            return;
        }
        name=sqlstring.escape(name);
        password=sqlstring.escape(password);
        let sqlC='select * from user where name like ' + name + ' and password like '+password;
        let sql=connect();
        sql.connect();
        sql.query(sqlC,(err,result)=>{
            if(err){
                res.send(
                    {
                        'state':0,
                        'erron':'连接sql出现问题:'+err
                    }
                )
                return;
            }
            let k=JSON.parse(JSON.stringify(result));
            if(k.length<=0){
                res.send({
                    'state':0,
                    'token':'',
                    'result':'No Such User',
                    'erron':'用户不存在'
                })
                return ;
            }
            let su=k[0];
            su.state=1;
            var tokenStr = jwt.sign(su, configs.jwtSecretKey, {
                expiresIn: '10h',
            })
            res.send({
                'state':1,
                'token':tokenStr,
                'result':k[0]
            });
        });
    }catch(e){
        res.send({
            'state':0,
            'erron':'主程序出现问题'+e
        })
    }
});
router.post('/signup',(req,res)=>{
    let emai=req.body.mail;
    let name=req.body.name;
    let password =req.body.password;
    if(typeof emai!=='string'||typeof name!=='string' || typeof password!=='string'){
        res.send(
            {
                'state':0,
                'erron':'有数据不为字符串!'
            }
        );
        return ;
    }
    if(!configs.mailReg.test(emai)){
        res.send(
            {
                'state':0,
                'erron':'邮箱不合法'
            }
        )
        return ;
    }
    if(!passwordReg.test(password)){
        res.send({
            'state':0,
            'erron':'密码不合法'
        })
    }
    var sql=connect();
    sql.connect();
    let semai=sqlstring.escape(emai);
    var sqlS='select * from user where email like '+semai;
    //check email
    sql.query(sqlS,(err,result)=>{
        if(err){
            res.send({
                'state':0,
                'erron':'连接sql出现问题'+err
            })
            return ;
        }
        try{
            let o=eval(result);
            if(typeof o!==typeof []){
                res.send({
                    'state':0,
                    'erron':'sql查询出未知类型'
                })
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
                        res.send({
                            'state':0,
                            'erron':'类型转换出现问题'
                        })
                        return ;
                    }
                });
                let resu={
                    state:0,
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
                res.send({
                    'state':0,
                    'erron':'邮箱已存在'
                })
            }
        }catch(e){
            res.send({
                'state':0,
                'erron':'主程序运行出错'+e
            });
            return ;
        }
    });

});
router.post('/vccode',(req,res)=>{
    let token=req.body.token;
    if(typeof token!=='string'){
        res.send(
            {
                'state':0,
                'erron':'token类型错误'
            }
        )
    }
    try{
        let k=jwt.verify(token,configs.jwtSecretKey);
        if(!k){
            res.send({
                'state':0,
                'erron':'已过期'
            });
        }
        if(typeof k==='string'){
            res.send({
                'state':0,
                'erron':'token异常'
            })
            return;
        }
        if(!req.body.vccode|| typeof req.body.vccode !='string'){
            res.send({'state':0,'erron':'错误验证码类型'});
            return;
        }
        if(req.body.vccode!=vccodes[token]){
            res.send({'state':0,'erron':'错误验证码'});
            return ;
        }
        let emai=k.mail;
        let name=k.name
        let password=k.password;
        if(typeof emai!=='string'||typeof name!=='string'||typeof password!=='string'){
            res.send({'state':0,'erron':'错误数据类型'});
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
                res.send({'state':0,'erron':'sql错误:'+err});
                return;
            }
            res.send({'state':0,'erron':'错误的文件'});
        });
    }catch(e){
        res.send({'state':0,'erron':'主程序错误'+e});
        return ;
    }
})
export default router;
