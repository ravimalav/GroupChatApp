const Sequelize=require('sequelize')

const sequelize=require('../util/database')

const userGroup=sequelize.define('UserGroupTable',
    {
        id:{
            type:Sequelize.INTEGER,
            autoIncrement:true,
            allowNull:false,
            primaryKey:true
        },
        userUserId:
        {
            type:Sequelize.INTEGER,
            allowNull:false
        },
        groupTableId:
        {
            type:Sequelize.INTEGER,
            allowNull:false
        },
        role:
        {
            type:Sequelize.STRING,
            allowNull:false
        }
    }
)

module.exports=userGroup;