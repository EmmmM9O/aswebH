import fs from 'fs';
import config from '../config';
const MapIO={
    datas:{
        "IdNow":0
    },
    load(){
        this.datas=JSON.parse(fs.readFileSync(config.path+'/maps.json').toString());
    },
    save(){
        fs.writeFileSync(config.path+'/maps.json',JSON.stringify(this.datas));
    }
}
MapIO.load();
export default MapIO;