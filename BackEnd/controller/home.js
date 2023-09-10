
const { where } = require('sequelize')
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

        // check that login user is admin or not

        const isAdmin=await userGroup.findOne(
            {
                where:
                {
                    groupTableId:groupId,
                    userUserId:req.user.user_id,
                }
            }
        )
        //   const messages=await Message.findAll()    //find all messages form table
          res.status(201).send({response:userName, isadmin:isAdmin, success:true})
      
    }
    catch(err)
    {
       res.status(500).send({error:"internal server error"})
    }
}   

exports.removeUser=async(req,res)=>
{
    const groupId=req.header("GroupId")
    const{userId}=req.params
    try{

        //check that user that send deleted request is admin or not\

        const isAdmin=await userGroup.findOne(
            {
                where:{
                    groupTableId:groupId,
                    userUserId:req.user.user_id,
                    role:'Admin'
                }
            }
        )
        console.log("chekc for admin ", isAdmin)
          if(isAdmin)
          {
            await userGroup.destroy(
                {
                    where:{
                       userUserId:userId,
                       groupTableId:groupId 
                    }
                }
              )
              const findUser=await User.findByPk(userId)
              console.log("user is removed successfully")
              res.status(201).send({response:`${findUser.name} removed by Admin`})
          }
          else
          {
            throw new Error(err)
          }
    }
    catch(err)
    {
        res.status(500).send({err})
    }
}

exports.makeAdmin=async(req,res)=>
{
    try{
          const groupId=req.header('GroupId')
          const {userId}=req.params

          //check user that make the request is admin or not

          const isAdmin=await userGroup.findOne(
            {
                where:
                {
                    groupTableId:groupId,
                    userUserId:req.user.user_id,
                    role:'Admin'
                }
            }
          )
              console.log("chek admin or not", isAdmin)
          if(isAdmin)
          {
            const userThatWillUpdate=await userGroup.findOne(          
               {
                where:
                {
                    groupTableId:groupId,
                    userUserId:userId,
                    role:'User'
                }
               }
            )
            await userThatWillUpdate.update(
                {
                    role:'Admin'
                }
            )
            console.log("role is updated ",userThatWillUpdate)
            res.status(201).send({success:true})
          }
          else{
            throw new Error(err)
          }
    }
    catch(err)
    {
        res.status(500).send(err)
    }
}

