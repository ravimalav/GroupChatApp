const authentication=require('../authenticate/auth')

const express=require('express')

const router=express.Router()

const groupController=require('../controller/group')

router.post('/creategroup',authentication.authenticate,groupController.createGroup)
router.get('/getgroupsname',authentication.authenticate,groupController.getGroupsName)
router.post('/adduseringroup',authentication.authenticate,groupController.inviteUser)
router.get('/getadmin',authentication.authenticate,groupController.getAdmin)

module.exports=router