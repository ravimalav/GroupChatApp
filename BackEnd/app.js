const express=require('express')

const app=express()

const sequelize=require('./util/database')

const dotenv=require('dotenv')
dotenv.config()


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

sequelize.sync()
// sequelize.sync({force:true})

.then(()=>
{
    app.listen(3000)
})
   


