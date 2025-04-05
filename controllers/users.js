const bycrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/users')

usersRouter.post('/',async (request,response,next) => {
    const {username, name, password} = request.body

    const saltRounds = 10
    const passwordHash = await bycrypt.hash(password, saltRounds)

    const user = new User({
        username,
        name,
        passwordHash
    })
    const savedUser = await user.save()
    response.status(201).json(savedUser)

})

usersRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('phones')
    response.json(users)
})

module.exports = usersRouter