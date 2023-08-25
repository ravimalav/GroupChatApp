const express=require('express')

const app=express()

const Sequelize=require('sequelize')
const sequelize=require('./util/database')

const bodyParser=require("body-parser")
app.use(bodyParser.json())

const cors=require('cors')
app.use(cors());


app.use((req,res,next)=>
{
    
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();

})

const userRouter=require('./routes/user')
app.use('/user',userRouter)

sequelize.sync()
// sequelize.sync({force:true})

.then(()=>
{
    app.listen(3000)
})
   


