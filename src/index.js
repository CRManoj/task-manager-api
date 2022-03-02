const express = require('express')

//require the mongoose file and just by require it will run the mongoose file and connect to the database
require('./db/mongoose')

//LOading the user router
const userRouter = require('./routers/user')
//loading the task router
const taskRouter = require('./routers/task')

//create express application
const app = express()
const port = process.env.PORT 

app.use(express.json())

//registering the user router
app.use(userRouter)
//registering the task router
app.use(taskRouter)

app.listen(port, () => {
    console.log('Server is Up On Port ' + port)
})