const Group=require('../models/group')
const userGroup=require('../models/usergroup')
const User=require('../models/user')

exports.createGroup=async(req,res)=>
{
    try{
         const {groupName}=req.body;
         const createGroup=await Group.create(
            {
                group_name:groupName,
                admin_name:req.user.name,
                admin_id:req.user.user_id
            }
         )

         const userGroupTableData={
            groupTableId:createGroup.id,
            userUserId:req.user.user_id,
            role:'Admin'
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

exports.getAdmin=async(req,res)=>
{
  try{
            const groupId=req.header('GroupId')
            const findAdminRaws=await userGroup.findAll(
              {
                where:
                {
                    groupTableId:groupId,
                    role:'Admin'
                }
              }
            )

            const records=await findAdminRaws.map((element)=>element.dataValues)

            const findAdminName=await User.findAll(            //find user's name that are admin in userGroupTable
              {
                where:
                {
                  user_id:records.map((res)=>res.userUserId)
                }
              }
            )
            res.status(201).send({response:findAdminName,success:true})
  }
  catch(err)
  {
    res.status(500).send({err})
  }
}

exports.inviteUser=async(req,res)=>
{
  try{
         const groupId=req.header('GroupId')
         const {inviteduserNumber}=req.body;
         
         const isInvitedUserExist=await User.findOne(         //check that invited user is exist or not
          {
              where:
              {
                phone_number:inviteduserNumber
              }
          }
         )  
  
         const isRequestedUserAdmin=await userGroup.findOne(         //check that requested user is admin or not
          {
            where:
            {
              groupTableId:groupId,
              userUserId:req.user.user_id,
              role:'Admin'
            }
          }
         )         
          if(isInvitedUserExist  && isRequestedUserAdmin )
          {
            await userGroup.create(
              {  groupTableId:groupId,
                 userUserId:isInvitedUserExist.user_id,
                 role:'User'
              }
              )
              res.status(201).send({response:`${isInvitedUserExist.name} added by admin`,success:true})
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