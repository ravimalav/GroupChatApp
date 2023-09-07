
const User=require('../models/user')
const userGroup=require('../models/usergroup')



exports.getusers=async(req,res)=>
{
    try{
        await req.user.update({login_status:true})
        const groupId=req.header('GroupId')
        console.log("get users groupId===>>>>> ", groupId)
         
        const userId=await userGroup.findAll(
            {
                where:
                {
                    groupTableId:groupId
                }
            }
        )
         const records=await userId.map(result=>result.userUserId)
         console.log("user id records that belongs to group table ", records)
        const userName=await User.findAll(
            {
                where:{
                    user_id:records
                }
            }
        )
        //   const messages=await Message.findAll()    //find all messages form table
          res.status(201).send({response:userName, success:true})
      
    }
    catch(err)
    {
       res.status(500).send({error:"internal server error"})
    }
}   

