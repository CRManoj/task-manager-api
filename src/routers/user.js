const express = require('express')
//load the multer libary
const multer = require('multer')
//loading the sharp libary
const sharp = require('sharp')
//loading the user model and to create a new instance of user
//loading the middleware
const auth = require('../middleware/auth')
//loading the account.js for mail
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account')
const User = require('../models/user')
const router = new express.Router()

//creating the http methods for users
router.post('/users', async (req,res) => {
    const user = new User(req.body)

    try{
        await user.save()
        //sending the welcome email
        sendWelcomeEmail(user.email, user.name)
        //generating the token once the user is saved
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    }catch (e) {
        res.status(400).send(e)
    }
})

//creating the router for the login
router.post('/users/login', async (req,res) => {
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user , token })
    }catch(e){
        res.status(400).send()
    }
})

//creating the route for the logout
router.post('/users/logout', auth ,async (req, res) =>{
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.user.save()

        res.send()
    }catch(e){
        res.status(500).send()
    }
})

//creating the router to logoutall means 
router.post('/users/logoutAll', auth, async (req,res) => {
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
}) 

//creating the get method for the reading and setting up the middleware
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

//searching only the specific task through id
router.get('/users/:id', async (req, res) => {
    //to access the dynamaic values in the path
    const _id = req.params.id

    try{
        const user = await User.findById(_id)

        if(!user) {
            return res.status(404).send()
        }

        res.send(user)
    }catch(e) {
        res.status(500).send(e)
    }
})

//we are creating the update using the patch as the http method
router.patch('/users/me', auth, async (req,res) => {

    //we have to get 400 if we add a new property
    const updates = Object.keys(req.body)
    const alloweUpdates = ['name','email','password','age']
    const isValidOperation = updates.every((update) => alloweUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send({ error: 'Invalid Updates'})
    }

    try{

        //const user = await User.findById(req.params.id)
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    }catch(e){
        res.status(400).send(e)
    }
})

//creating the http method for the delete
router.delete('/users/me', auth, async (req, res) => {
    try{
        //const user = await User.findByIdAndDelete(req.user._id)

        // if(!user){
        //     return res.status(404).send()
        // }
        await req.user.remove()
        //sending the cancelation email
        sendCancelationEmail(req.user.email, req.user.name)
        res.send(req.user)
    }catch(e){
        res.status(500).send()
    }
})

//setting up the endpoint for the avatar upload
const upload = multer({
    limit: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png|webp)$/)) {
            return cb(new Error('Please upload an image'))
        }

        cb(undefined, true)
    }
})

//this router can be used for both create and update avatar
router.post('/users/me/avatar' , auth, upload.single('avatar'), async (req,res) => {
    //we will be changeing the size and format of the image
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    //we will be storing in the avatar field 
    req.user.avatar = buffer
    await req.user.save()
    res.send()
},(error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

//creating the router for the delete
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

//creating the router for fetching the image
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar){
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch(e) {
        res.status(404).send()
    }
})

module.exports = router