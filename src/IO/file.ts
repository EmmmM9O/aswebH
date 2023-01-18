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
    }
}