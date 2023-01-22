const express=require('express');
var app=express();
app.use(express.static('/root/sd/'));
app.listen(4000,()=>{
	    console.log("listen ok");
})
