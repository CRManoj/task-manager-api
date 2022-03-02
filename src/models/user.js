const mongoose = require('mongoose')
const validate = require('validator')
//importing the bcrypt
const bcrypt = require('bcryptjs')
//importing the json webtoken
const jwt = require('jsonwebtoken')
//loading the task module
const Task = require('./task')

//now the schema is created pass the user and this schema is passed as user second object
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        //value must be entered
        required: true,
        trim:true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase:true,
        //we will be checking the enter email is valid or not through the validate libary
        validate(value){
            if(!validate.isEmail(value)){
                throw new Error('Email is Invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Password Cannot contain "Password"')
            }
        }
    },
    age: {
        type: Number,
        default:0,
        //checking the entered value is valid or not through the validate
        validate(value){
            if(value < 0){
                throw new Error('Age must be Postive Number')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function () {
    const user = this 
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

//generating the tokens
userSchema.methods.generateAuthToken = async function () {
    const user = this 
    const token = jwt.sign({ _id: user._id.toString() }, aprocess.env.JWT_SECRET )

    //generated token is saved to the database
    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

//toCheck the login credentials
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if(!user) {
        throw new Error('Unable to Login')
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch) {
        throw new Error('Unable To Login')
    }

    return user
}


//HAsh the plain text password before saving
userSchema.pre('save', async function(next) {
    const user = this 

    //checking the password is hashed or not
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

//Delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({ owner: user._id })
    next()
})

//defining the model 
//now we will define the basic version user model and model has name and age with value of objects
const User = mongoose.model('User', userSchema)

//we need to export the file to create the dat
module.exports= User