const mongoose = require('mongoose')

//Explicitly create task
const taskSchema = new mongoose.Schema({
    description:{
        type: String,
        trim : true,
        required: true
    },
    completed: {
        type : Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
}, {
    timestamps: true
})

//1.Define the model with description and the completed fields
const Task = mongoose.model('Task', taskSchema)

//export to other file to use it
module.exports = Task