const express=require('express')

const router=express.Router()

const userController=require('../controller/user')

router.post('/signup',userController.signup)

module.exports=router;