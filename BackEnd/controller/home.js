const User=require('../models/user')
const Message=require('../models/message')


exports.getusers=async(req,res)=>
{
    try{
        await req.user.update({login_status:true})
        const userName=await User.findAll(
            {
                where:{login_status:true}
            }
        )
          const messages=await Message.findAll()    //find all messages form table
          res.status(201).send({loginresponse:userName,messageresponse:messages, success:true})
      
    }
    catch(err)
    {
       res.status(500).send({error:"internal server error"})
    }
}   

exports.postmessage=async(req,res)=>
{
    try{
          const {inputMessage}=req.body;
          const username=req.user.name;
          console.log("name is "+req.user.name)
          const createMessage=await Message.create(
            {
                message_body:inputMessage,
                user_name:req.user.name,
                userUserId:req.user.user_id
                
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
          const findOldMessages=await Message.findAll()
          res.status(201).send({response:findOldMessages,success:true})
    }
    catch
    {
        res.status(500).send({error:"Something went wrong at server side to get old messages"})
    }
}