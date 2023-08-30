
const User=require('../models/user')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const process=require('process')

const jsonTokenGenerator=(id,name)=>
{
   return jwt.sign({userId:id,loginUserName:name},process.env.JWT_SECRET_KEY);
}

exports.signup=async(req,res)=>
{
    try
    {
        const {userName,userEmail,userPhoneNumber,userPassword}=req.body;
        //encrypt the password using bcryptlibrary
        const saltRound=10;   //to strength of incryption we used saltrounds
        const hashPassword=await bcrypt.hash(userPassword,saltRound)

        const findUser=await User.findOne({
            where: {
                email:userEmail
            } 
        })
        if(findUser)
        {
           return res.status(401).send({response:"user already exist",success:false})
        }
          
            const createUser=await User.create(
                {
                    name:userName,
                    email:userEmail,
                    phone_number:userPhoneNumber,
                    password:hashPassword
                }
            )
        
            res.status(200).send({response:createUser,success:true})
        
    }
    catch(error)
    {
       res.status(500).send({error:"signup invalid"})
    }
}



exports.login=async(req,res)=>
{
    try{
         const {loginEmail,loginPassword}=req.body;
         
         
         const isUserExist=await User.findOne({
            where:{email:loginEmail}
         })
        
         if(isUserExist)
         {
            bcrypt.compare(loginPassword,isUserExist.password,async(err,result)=>
            {
                if(err)
                {
                    throw new Error("Something went wrong")
                }
                if(result===true)
                {
                   res.status(200).json({success:true,token:jsonTokenGenerator(isUserExist.user_id,isUserExist.name)})
                }
                else{
                    return res.status(401).json({error:"error"})
                }
                 
            })
            
         }
         else
         {
            return res.status(404).json({error:"user not exist",success:false})
         }
            
    }
    catch(err)
    {
       res.status(500).send(err)
    }
}