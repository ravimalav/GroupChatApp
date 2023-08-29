const jwt=require('jsonwebtoken')

const User=require('../models/user')

const authenticate=async(req,res,next)=>
{
    try{
        const token=req.header('Authorization')
        const user= jwt.verify(token,process.env.JWT_SECRET_KEY)

         const userById=await User.findByPk(user.userId)
         {
           req.user=userById
         }
         next();
    }
    catch(err)
    {
        res.status(404).send({error:"user not found"})
    }
}

module.exports={
    authenticate
}

