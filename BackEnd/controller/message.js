const { Op } = require('sequelize');
const Message=require('../models/message')

exports.getMessages=async(req,res)=>
{
    try{
            const groupId=req.header('GroupId')
            const getMessage=await Message.findAll(
                {
                    where:{
                        groupTableId:groupId,
                        userUserId:req.user.id
                    }
                }
            )
            res.status(201).send({response:getMessage,success:true})
    }
    catch
    {
       res.status(500).send({err:"can't get messages at this time"})
    }
}

exports.postmessage=async(req,res)=>
{
    try{
          const {inputMessage}=req.body;
          const username=req.user.name;
          const groupId=req.header('GroupId')
          const createMessage=await Message.create(
            {
                message_body:inputMessage,
                user_name:req.user.name,
                userUserId:req.user.user_id,
                groupTableId:groupId
            }
          ) 
          res.status(201).send({response:username})
    }
    catch(err)
    {
       res.status(500).send({error:"something wrong in chat system"})
    }
}

exports.oldmessages=async(req,res)=>
{
    try{
        if(+req.query.id===1)
        {
            return res.status(500).send({response:"There is no message in group"})
        }
        const lastId=+req.query.id;
        const groupId=req.header('GroupId')
        
          const findOldMessages=await Message.findAll(
            {
                where:{
                    groupTableId:groupId,
                    message_id:{[Op.lt]:[lastId]}
                },
            }
          )
          const records=await findOldMessages.map((message)=>message.dataValues)
          if(records.length>=10)
          {
               let newRecord=[]
               for(let i=records.length-10;i<records.length;i++)
               {
                newRecord.push(records[i])
               }
               res.status(201).send({response:newRecord,success:true})
          }
          else{
            res.status(201).send({response:records,success:true})
          }    
    }
    catch
    {
        res.status(500).send({error:"Something went wrong at server side to get old messages"})
    }
}