const express=require('express')

const router=express.Router()

const authentication=require('../authenticate/auth')

const homeController=require('../controller/home')

router.get('/getusers',authentication.authenticate,homeController.getusers)
router.post('/postmessage',authentication.authenticate,homeController.postmessage)


module.exports=router