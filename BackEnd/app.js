const express=require('express')

const app=express()

const dotenv=require('dotenv')
dotenv.config()

const path=require('path')

const sequelize=require('./util/database')

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

const groupRouter=require('./routes/group')
app.use('/group',groupRouter)

const messageRouter=require('./routes/message')
app.use('/message',messageRouter)

app.use((req,res)=>
{
   res.sendFile(path.join(__dirname,`frontendCode/${req.url}`))
})

//assosiations

const User=require('./models/user')
const Message=require('./models/message')

User.hasMany(Message)        //many to many
Message.belongsTo(User)     //one to many with foreign key in model B

const Group=require('./models/group')
const UserGroupTable=require('./models/usergroup')
Group.belongsToMany(User,{through:UserGroupTable})
User.belongsToMany(Group,{through:UserGroupTable})

Group.hasMany(Message)     
Message.belongsTo(Group)    

sequelize.sync()
// sequelize.sync({force:true})

.then(()=>
{
    app.listen(3000)
})
   


