//we will be loading the JWT for validating the token being provided
const jwt = require('jsonwebtoken')
//loading the user model for finding them in the database once we validate the token
const User = require('../models/user')


const auth = async (req, res, next) => {
    //validate the user 
    try{
        const token = req.header('Authorization').replace('Bearer ','')
        const decoded = jwt.verify(token, process.env.JWT_SECRET )
        const user = await User.findOne({ _id: decoded._id, 'tokens.token':token })
        
        if(!user) {
            throw new Error()
        }

        req.token = token
        req.user = user
        next()
    }catch(e){
        res.status(401).send({ error : 'please authenticate'})
    }
}

module.exports = auth