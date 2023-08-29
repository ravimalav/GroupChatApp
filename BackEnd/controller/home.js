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
        console.log("username==>>"+userName)
        res.status(201).send({response:userName})
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
          const createMessage=await Message.create(
            {
                message_body:inputMessage
            }
          )
          console.log("name of user is "+req.user.name)
          res.status(201).send({response:username})
    }
    catch(err)
    {
       res.status(500).send({error:"something wrong in chat system"})
    }
}