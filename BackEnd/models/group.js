const Sequelize=require('sequelize')

const sequelize=require('../util/database')

const Group=sequelize.define('group_table',
{
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        autoIncrement:true,
        primaryKey:true
    },
    group_name:
    {
        type:Sequelize.STRING,
        allowNull:false
    },
    admin_name:
    {
        type:Sequelize.STRING,
        allowNull:false
    },
    admin_id:
    {
        type:Sequelize.INTEGER,
        allowNull:false,   
    }
})

module.exports=Group;