import express from 'express';
import mysql from 'mysql'
import configs from '../config'
import sqlstring from 'sqlstring'
import  jwt  from 'jsonwebtoken';
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
export default router;