const Sequelize=require('sequelize')

const sequelize=require('../util/database')

const Message=sequelize.define('message',
{
    message_id:
    {
       type:Sequelize.INTEGER,
       allowNull:false,
       primaryKey:true,
       autoIncrement:true
    },
    message_body:
    {
        type:Sequelize.STRING,
        allowNull: true,
        validate: {
          notEmpty: false,
          len: {
            args: [1, 200],
            msg: 'Please provide field within 1 to 200 characters.'
          }
        }
    }
});

module.exports=Message;