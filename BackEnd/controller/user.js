
const User=require('../models/user')
const bcrypt=require('bcrypt')
exports.signup=async(req,res)=>
{
    try
    {
        const {userName,userEmail,userPhoneNumber,userPassword}=req.body;
        //encrypt the password using bcryptlibrary
        const saltRound=10;   //to strength of incryption we used saltrounds
        const hashPassword=await bcrypt.hash(userPassword,saltRound)
        console.log("hashPassword==>>>"+hashPassword)

        const findUser=await User.findOne({
            where: {
                email:userEmail
            } 
        })
        if(findUser)
        {
           return res.status(401).send({response:"user already exist",success:false})
        }
        else{
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
    }
    catch(error)
    {
       res.status(500).send({error:"signup invalid"})
    }

}