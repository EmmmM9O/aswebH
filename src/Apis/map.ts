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
import file from '../IO/file';
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
    console.log(req.files);
    console.log(req.body);
    if(typeof mapName!=='string'||typeof mapAnother!=='string'||typeof mapDecs!=='string'){
        res.send({'state':0,'erron':'错误的类型'});
        console.log('类型错误');
        return ;
    }
    if(req.files==null||req.files.length<=0){
        res.send({'state':0,'erron':'错误的文件'});
        console.log('文件错误');
        return ;
    }
    if(typeof token!=='string'){
        res.send({'state':0,'erron':'错误的token'});
        console.log('token错误');
        return ;
    }
    if(req.files instanceof Array<File>){
        try{
            let k=jwt.verify(token,configs.jwtSecretKey);
            if(!k){
                res.send({'state':-1,'erron':'已过期'});
                console.log('过期');
                return ;
            }
            if(typeof k!='object'){
                res.send({'state':0,'erron':'错误的token类型'});
                console.log('token错误');
                return ;
            }
            if(k.state!=1){
                res.send({'state':0,'erron':'错误的状态'});
                console.log('状态错误');
                return;
            }
            let icon,msav;
            for(let i of req.files){
                if(path.parse(i.originalname).ext=='.msav') msav=i;
                if(path.parse(i.originalname).ext=='.png') icon=i;
                
            }
            if(icon==null||msav==null){
                res.send({'state':0,'erron':'请确保1个msav一个png'});
                return;
            }
            let w=k;
            //const newname=icon.path+path.parse(icon.originalname).ext;
                MapIO.load();let id=MapIO.datas.IdNow+1;
                let pathw=configs.path+'/maps/'+String(id);
                fs.mkdirSync(pathw)
                fs.renameSync(icon.path,pathw+'/icon.png');
                fs.renameSync(msav.path,pathw+'/map.msav')
                    let sql=connect();
                    sql.connect();
                    let sqlS:string='insert into maps (id,name,upload,another,MapPath,decs) values ("'
                    +id+'",'+sqlstring.escape(mapName)+','+sqlstring.escape(w.name)+','+sqlstring.escape(mapAnother)
                    +',"'+path+'",'+sqlstring.escape(mapDecs)+')';
                    sql.query(sqlS,(err,_result)=>{
                        if(err){
                            console.error(err);
                            res.send({'state':0,'erron':'错误的sql:'+err});
                            console.log('错误sql'+err);
                            file.rmDir(pathw);
                            return ;
                        }
                        res.send({'state':1,'result':_result});
                        MapIO.datas.IdNow++;
                        MapIO.save();
                    });
        }catch(e){
            console.log(e);
            res.send({'state':0,'erron':'主程序出错'+e});
            return ;
        }
    }else{
        console.log('错误的类型主');
        res.send({'state':0,'erron':'错误的类型'})    
    }
})
/*
select * from table limit (start-1)*pageSize,pageSize
*/
router.post('/getMap/PageAll',(req,res):any=>{
    console.log(req.body);
    let page=Number(req.body.page);
    let pageSize=Number(req.body.pageSize);
    let sea=req.body.sea;
    let seaN=req.body.seaN;
    if(isNaN(page)||page==null||page<=0||pageSize==null||isNaN(pageSize)||pageSize<=0){
        return res.send({'state':0,'erron':'错误的页码'});
    }
    if(typeof sea!=`string`||!(seaN instanceof Array<string>)){
        return res.send({'state':0,'erron':'错误的类型'});
    }
    if(seaN.length<=0) {
	    return res.send({'state':0,'erron':'没有选项'});
    }
    if(sea.length<=0) sea='.';
    interface e{
        [inde:string]:string
    }
    let r={"名字":"name","作者":"another","简介":"decs"} as e,s='';
    for(let i=0;i<seaN.length;i++){
        if(typeof seaN[i]!=='string')break;
        s+=r[seaN[i]]+' REGEXP '+sqlstring.escape(sea)+' ';
        if(i!=seaN.length-1){
            s+='or ';
        }
    }
    let sqlS='select * from maps where '+s+' limit '+(page-1)*pageSize+','+pageSize+'';
    let sql=connect();
    sql.connect();
    sql.query(sqlS,(err,result):any=>{
        if(err){
		console.error(err)
            return res.send({'state':0,'erron':'sql错误!:'+err});
        }
        return res.send({'state':1,'result':result});
    })
});
router.get('/getPng/:id',(req,res)=>{
    let id=Number(req.params.id);
    if(isNaN(id)||id==null||id<0){
        res.send({'state':0,'erron':'错误id'});
        return ;
    }
    let temp=configs.path+'/maps/'+id;
    if(!fs.existsSync(temp)){
        res.send({'state':0,'erron':'不存在的地图'});  
        return ;
    }
    if(!fs.statSync(temp).isDirectory()){
        res.send({'state':0,'erron':'错误的地图'});  
        return ;
    }
    if(!fs.existsSync(temp+'/icon.png')){
        res.send({'state':0,'erron':'没有图标'});  
        return ;
    }
    res.sendFile(temp+'/icon.png')
})
router.get('/getMap/ById/:id',(req,res)=>{
    let id=Number(req.params.id);
    if(isNaN(id)||id==null||id<0){
        res.send({
            'state':0,
            'erron':'错误id'
        });
        return;
    }
    let temp=configs.path+'/maps/'+id;
    let Tpath='/tmp/asweb/'+id+'.zip';
    if(!fs.existsSync(temp)){
        res.send({'state':0,'erron':'不存在的地图'});  
        return ;
    }
    if(!fs.statSync(temp).isDirectory()){
        res.send({'state':0,'erron':'错误的地图'});  
        return ;
    }
        try{
            compressing.zip.compressDir(temp,Tpath).then(()=>{
                res.download(Tpath,String(id)+'.zip',function (err) {
                    if (err) res.send({'state':0,'erron':'出现问题'})
                  });
                fs.unlinkSync(Tpath);
            }).catch(err=>{
                res.send({'state':0,'erron':'压缩出错'+err});  
                console.error(err);
                fs.unlinkSync(Tpath);
            });
        }catch(e){
            res.send({'state':0,'erron':'下载出错'+String(id)});  
            console.error(e);
        }

});
export default router;
