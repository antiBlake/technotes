const User = require('../models/User')
const Note = require('../models/Note')
//dependecies for the controller
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')
const { findById } = require('../models/User')

//get user
//route GET /users
// access private

const getAllUsers = asyncHandler (async (req, res)=>{
    const users = await User.find().select('-password').lean()
    if(!users){
        return res.status(400).json({message: 'no user found'})
    }

})

//create user
//route CREATE /users
// access private

const createNewUser = asyncHandler (async (req, res)=>{
    const { username, password, roles } = req.body

    //confirm data
    if(!username || !password || !Array.isArray(roles) || !roles.length){
        return res.status(400).json({message: 'All fields are required'})

    }

    //check for duplicate
    const duplicate = await User.findOne({username}).lean().exec()
    if(duplicate){
        return res.status(409).json({message: 'Duplicate Username'})
    }

    //Hash password for db

    const hashedpwd = await bcrypt.hash(password,10) //salt rounds

    const userObj = { username,"password": hashedpwd, roles}

    //create and store new user
    const user = await User.create(userObj)
    if(user){
        return res.status(201).json({message: `New user ${username} created`})
    } else{
        return res.status(400).json({message: 'Invalid user data received'})
    }

})
//update user
//route PATCH /users
// access private
const updateUser = asyncHandler (async (req, res)=>{
    const { id, username, roles, active, password} = req.body

    if(!id || !username || !Array.isArray(roles) || !roles.length || typeof active !=='boolean'){
        return res.status(400).json({message: 'All fields are required'})
    }

    const user = await findById(id).exec()
    if(!user){
        return res.status(400).json({message: 'no user found'})
    }

    // check for duplicate

    const duplicate = await User.findOne({username}).lean().exec()

    if(duplicate && duplicate?._id.toString() !== id){
        return res.status(409).json({message: 'Duplicate Username'})
     }

     user.username = username
     user.roles = roles
     user.active = active

     if(password){
        //Hash password
        user.password = await bcrypt.hash(password, 10) // salt rounds
     }

     const updatedUser = await user.save()

     res.json({ message: `${updatedUser.username} updated`})

})
//delete user
//route DELETE /users
// access private

const deleteUser = asyncHandler (async (req, res)=>{

    const {id} = req.body

    if(!id){
        return res.status(400).json({message: 'User ID required'})
    }
    const notes = await Note.findOne({ user: id}).lean().exec()
    if(notes?.length){
        return res.status(400).json({message: 'User has assigned notes'})
    }

    const user = await User.findById(id).exec()
    if(!user){
        return res.status(400).json({message: 'no user found'})
    }
    const result = await user.deleteOne()

    const reply = `Username ${result.username} with ID ${result._id} deleted`

    res.json(reply)
})

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}
