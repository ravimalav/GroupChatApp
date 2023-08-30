const express=require('express')

const app=express()

const sequelize=require('./util/database')

const dotenv=require('dotenv')
dotenv.config()

//socket.io for real time system

const socket=require('socket.io')


const bodyParser=require("body-parser")
app.use(bodyParser.json())

const cors=require('cors')
app.use(cors(
    {
        origin:true,
        credentials:true,
    }
));


const userRouter=require('./routes/user')
app.use('/user',userRouter)

const homeRouter=require('./routes/home')
app.use('/home',homeRouter)


const User=require('./models/user')
const Message=require('./models/message')

User.hasMany(Message)        //many to many
Message.belongsTo(User)     //one to many with foreign key in model B

sequelize.sync()
// sequelize.sync({force:true})

.then(()=>
{
    app.listen(3000)
})
   


