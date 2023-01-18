/*

CREATE TABLE IF NOT EXISTS `maps`(
    `id` INT UNSIGNED AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `upload` VARCHAR(100) NOT NULL,
    `decs` VARCHAR(400) NOT NULL,
    `MapPath` VARCHAR(100) NOT NULL,
    `another` VARCHAR(100) NOT NULL,
    PRIMARY KEY ( `id` )
    )ENGINE=InnoDB DEFAULT CHARSET=utf8;
*/

import express from 'express';
import configs from '../config';
import mysql from 'mysql';
import sqlstring from 'sqlstring';
import multer from 'multer';
import fs from 'fs';
import MapIO from '../IO/mapIO';
import compressing from 'compressing';
import path from 'path';
import jwt from 'jsonwebtoken';
var objMulter=multer({dest: configs.path+'/maps'});
function connect(){
    return mysql.createConnection(configs.MySqlConfig);
}
if(!fs.existsSync('/tmp/asweb')){
    fs.mkdir('/tmp/asweb',(err)=>{
    if(err){
        console.error(err);
    }
})}
MapIO.load();
const router=express.Router();
router.use('/upload',objMulter.any());
router.post('/upload',(req,res)=>{
    let mapName=req.body.name;
    let mapAnother=req.body.another;
    let mapDecs=req.body.decs;
    let token=req.body.token;
    if(typeof mapName!=='string'||typeof mapAnother!=='string'||typeof mapDecs!=='string'){
        res.send({'state':0,'erron':'错误的类型'});
        return ;
    }
    if(req.files==null||req.files.length<=0){
        res.send({'state':0,'erron':'错误的文件'});
        return ;
    }
    if(typeof token!=='string'){
        res.send({'state':0,'erron':'错误的token'});
        return ;
    }
    if(req.files instanceof Array<File>){
        try{
            let k=jwt.verify(token,configs.jwtSecretKey);
            if(!k){
                res.send({'state':-1,'erron':'已过期'});
                return ;
            }
            if(typeof k!='object'){
                res.send({'state':0,'erron':'错误的token类型'});
                return ;
            }
            if(k.state!=1){
                res.send({'state':0,'erron':'错误的状态'});
                return;
            }
            let w=k;
            const newname=req.files[0].path+path.parse(req.files[0].originalname).ext;
            let d=req.files[0].path;
            fs.rename(req.files[0].path,newname,function(err){
                if(err){
                    console.error(err);
                    res.send({'state':0,'erron':'文件重命名错误'});
                    fs.unlink(d,err=>{if(err) console.error(err)});
                    return ;
                }
                MapIO.load();let id=MapIO.datas.IdNow+1;
                let path=configs.path+'/map/'+String(id);
                compressing.zip.uncompress(newname,path).catch(err=>{
                    console.error(err);
                    res.send({'state':0,'erron':'错解压出错'});
                    fs.unlink(newname,err=>{if(err) console.error(err);});
                }).then(_=>{
                    let sql=connect();
                    sql.connect();
                    let sqlS:string='insert into user (id,name,upload,another,MapPath,decs) values ('
                    +sqlstring.escape(id)+','+sqlstring.escape(mapName)+','+sqlstring.escape(w.name)+','+sqlstring.escape(mapAnother)
                    +','+path+','+sqlstring.escape(mapDecs)+')';
                    sql.query(sqlS,(err,_result)=>{
                        if(err){
                            console.error(err);
                            res.send({'state':0,'erron':'错误的sql:'+err});
                            fs.unlink(path,(err)=>{if(err) console.error(err);});
                            return ;
                        }
                        res.send({'state':0,'result':_result});
                    });

                })
            });
        }catch(e){
            console.log(e);
            res.send({'state':0,'erron':'主程序出错'+e});
            return ;
        }
    }else{
        res.send({'state':0,'erron':'错误的类型'})    
    }
})

router.get('/getMap/ById/:id',(req,res)=>{
    let id=Number(req.params.id);
    if(isNaN(id)||id==null||id<=0){
        res.send({
            'state':0,
            'erron':'错误id'
        });
        return;
    }
    let sqlC='select * from maps where id like '+sqlstring.escape(id);
    let sql=connect();
    sql.connect();
    sql.query(sqlC,(err,result)=>{
        if(err){
            res.send({'state':0,'erron':'sqlerr:'+err});
            return;
        }
        let k=JSON.parse(JSON.stringify(result));
        if(k.length<=0){
            res.send({'state':0,'erron':'没有地图'+String(id)});
            return ;
        }
        try{
            let path='/tmp/asweb/'+k.name;
            compressing.zip.compressDir(k.MapPath,path).then(()=>{
                res.download(path);
            }).catch(err=>{
                res.send({'state':0,'erron':'压缩出错'+err});  
            });
        }catch(e){
            res.send({'state':0,'erron':'下载出错'+String(id)});  
        }
    })

});
export default router;