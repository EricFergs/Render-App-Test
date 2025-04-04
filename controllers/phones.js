const phonesRouter = require('express').Router()
const Phone = require('../models/phone')

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

phonesRouter.post('/', async (request,response,next) => {
  const body = request.body
  const exists = await Phone.findOne({name:body.name})
  if (exists){
    return response.status(409).json({ error : 'Already exists' })
  }
  const phone = new Phone({
    'name' : body.name,
    'number': body.number
  })
  const savedPhone = await phone.save()
  return response.status(201).json(savedPhone)
})



module.exports = phonesRouter