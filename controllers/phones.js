const phonesRouter = require('express').Router()
const Phone = require('../models/phone')
const User = require('../models/users')
const jwt = require('jsonwebtoken')



phonesRouter.get('/',async (request,response) => {
  const phones = await Phone.find({})
  response.json(phones)
})


phonesRouter.get('/:id',(request,response,next) => {
  const id = request.params.id
  Phone.findById(id).then(phone => {
    if (phone){
      return response.json(phone)
    }
    else{
      return response.status(404).end()
    }
  }).catch(error => next(error))
})

phonesRouter.delete('/:id',async (request,response,next) => {
  const id = request.params.id
  await Phone.findByIdAndDelete(id)
  response.status(204).end()
})

phonesRouter.put('/',(request,response, next) => {
  const { name, number, id } = request.body
  if(!name || !number){
    return response.status(404).json({
      error : 'Mising body or number'
    })
  }
  Phone.findById(id)
    .then(phone => {
      if (!phone) {
        return response.status(404).json({ error: 'The person does not exists anymore' })
      }

      phone.name = name
      phone.number = number

      return phone.save().then((updatedPhone => {
        response.json(updatedPhone)
      }))
    })
    .catch(error => next(error))
})
const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}
phonesRouter.post('/', async (request,response,next) => {
  const body = request.body
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const user = await User.findById(decodedToken.id)
  const exists = await Phone.findOne({name:body.name})
  if (exists){
    return response.status(409).json({ error : 'Already exists' })
  }
  const phone = new Phone({
    'name' : body.name,
    'number': body.number,
     createdBy: user.id
  })
  const savedPhone = await phone.save()
  user.phones = user.phones.concat(savedPhone._id)
  await user.save()
  return response.status(201).json(savedPhone)
})



module.exports = phonesRouter