const Group=require('../models/group')
const userGroup=require('../models/usergroup')
const User=require('../models/user')

exports.createGroup=async(req,res)=>
{
    try{
         const {groupName}=req.body;
         console.log("groupname===>>>"+groupName)
         console.log("username===>>>"+req.user.name)
         const createGroup=await Group.create(
            {
                group_name:groupName,
                admin_name:req.user.name,
                admin_id:req.user.user_id
            }
         )
         const userGroupTableData={
            groupTableId:createGroup.id,
            userUserId:req.user.user_id
         }
           await userGroup.create(
             userGroupTableData
         )
         res.status(201).send({response:createGroup,success:true})
    }
    catch
    {
      res.status(500).send({err:"can not create group at this time"})
    }
}

exports.getGroupsName=async(req,res)=>
{
  try{

       const groupTableId=await userGroup.findAll(
        {
          where:
          {
            userUserId:req.user.user_id
          }
        }
       )
       const records=await groupTableId.map(result=>result.dataValues)
    
       const getGroupName=await Group.findAll(
        {
          where:{
            id:records.map((res)=>res.groupTableId)
                //  id:records[0].groupTableId 
          }
        }
       )
       res.status(200).send({response:getGroupName,success:true})
  }
  catch
  {
   res.status(500).send({error:"something wrong in creating groups"})
  }
}

exports.inviteUser=async(req,res)=>
{
  try{
         const groupId=req.header('GroupId')
         const {inviteduserid}=req.body;
         
         const checkuserId=await User.findByPk(inviteduserid)     //check that invited user is exist or not
         
         const checkAdmin=await Group.findByPk(groupId)           //check that requested user is admin or not
         console.log("check admin id ===>>>>", checkAdmin.admin_id)
        
          if(checkuserId  && req.user.user_id==checkAdmin.admin_id )
          {
            await userGroup.create(
              {  groupTableId:groupId,
                userUserId:inviteduserid}
                )

                 res.status(201).send({response:`${checkuserId.name} added by admin`,success:true})
          }
          else
          {
            throw new Error("invited user is not exist");
          }
        
  }
  catch(Error)
  {
     res.status(500).send(Error)
  }
}