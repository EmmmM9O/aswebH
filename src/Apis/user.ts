import express from 'express';
import mysql from 'mysql'
import configs from '../config'
import sqlstring from 'sqlstring'
import  jwt  from 'jsonwebtoken';
import app from 'src/apis';
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
        let sqlC='select * from user where name like ' + '"' + name + '" and password like '+'"'+password+'"';
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
app.post('/signup',(req,res)=>{
    let emai=req.body.emai;
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
    emai=sqlstring.escape(emai);let flag:boolean =false;
    var sqlS='select * from user where email like emai';
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
                flag=true;
                /* send vccode to email */
                let vccde:string=String(Math.floor(Math.random()%10000));
                return;
            }else{
                res.send('has an email');
            }
        }catch(e){
            res.send('erron on e');
            return ;
        }
    });

});
export default router;