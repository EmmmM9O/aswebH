import fs from 'fs';
import configs from '../config';
export default {
    mkdir(path:string){
        if(!fs.existsSync(path)){
            fs.mkdir('/tmp/asweb',(err)=>{
                if(err) console.error(err);
            });
        }
    },
    mkdirI(path:string){
        if(!path.startsWith('/')){
            path='/'+path;
        }
        this.mkdir(configs.path+path);
    },
    rmDir(path:string){
        if(fs.existsSync(path)){
            var files = fs.readdirSync(path);
            files.forEach((file,_index)=>{
                var curPath = path + "/" + file;
                if(fs.statSync(curPath).isDirectory()){
                    this.rmDir(curPath);
                }else{
                    fs.unlinkSync(curPath)
                }
            });
            fs.rmdirSync(path);
        }
    }
}
