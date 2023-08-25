
const Sequelize=require('sequelize')

const sequelize=new Sequelize(
    'groupchatapp',
    'root',
    'ravi2233',
    {
       dialect:'mysql',
       host:'localhost'
    }
)

module.exports=sequelize;