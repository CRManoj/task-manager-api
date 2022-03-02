const express = require('express')
//loading the task module and to create a new instance of task
const Task = require('../models/task')
//loading the auth folder
const auth = require('../middleware/auth')
const router = new express.Router()

//creating the http methods for tasks
router.post('/tasks', auth, async (req, res) => {
    //const task = new Task(req.body)
    const task = new Task({
        ...req.body,
        owner: req.user._id,
        ref: 'User'
    })

    try{
        await task.save()
        res.status(201).send(task)
    }catch(e){
        res.status(400).send(e)
    }
})

//Reading all the tasks and setting up the query
//GET /tasks/completed=true
//GET /tasks?limit=1&skip=2
//GET /tasks?sortBy=createdAt:desc (or) asec
router.get('/tasks', auth, async (req,res) => {
    //setting up the query 
    const match = {}
    const sort  = {}

    if(req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try{
        //const tasks = await Task.find({ owner: req.user._id })
        await req.user.populate({
            path: 'tasks',
            match,
            //setting up the paginating data
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    }catch(e){
        res.status(500).send(e)
    }
})

//finding the specific tasks
router.get('/tasks/:id', auth,async (req, res) => {
    const _id = req.params.id

    try{
        const task = await Task.findOne({ _id, owner: req.user._id })

        if(!task){
            return res.status(404).send()
        }

        res.send(task)
    }catch(e){
        res.status(500).send(e)
    }
})

//creating the update HTTP Request for the task
router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const alloweUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => alloweUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send({ error : 'Invalid Updates'})
    }

    try{
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id})
        //const task = await Task.findById(req.params.id)

        if(!task){
            return res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()

        res.send(task)
    }catch(e){
        res.status(400).send(e)
    }
})

//creating the delete method for the route
router.delete('/tasks/:id', auth, async (req,res) => {
    try{
        //const task = await Task.findByIdAndDelete(req.params.id)
        const task = await Task.findByIdAndDelete({ _id: req.params.id, owner: req.user._id})

        if(!task){
            res.status(404).send()
        }

        res.send(task)
    }catch(e){
        res.status(500).send()
    }
})

module.exports = router
