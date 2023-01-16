import express from 'express';
const app = express.Router();
app.get('/test',(_req,res)=>{
    res.send('test is ok');
})

export default app;