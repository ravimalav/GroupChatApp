const express=require('express')

const router=express.Router()

const authentication=require('../authenticate/auth')

const homeController=require('../controller/home')

router.get('/getusers',authentication.authenticate,homeController.getusers)
router.delete('/removeuser/:userId',authentication.authenticate,homeController.removeUser)
router.put('/makeadmin/:userId',authentication.authenticate,homeController.makeAdmin)


module.exports=router