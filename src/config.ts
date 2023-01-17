export default{
    port:'3000',
    jwtSecretKey: 'wjy00',
    MySqlConfig:{
        host     : '127.0.0.1',
        user     : 'root',
        password : '123456',
        database : 'User'
    },
    passwordReg :/^[0-9A-Za-z]{4,15}$/,
    mailReg:/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/
}