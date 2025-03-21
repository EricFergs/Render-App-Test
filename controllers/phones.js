const phonesRouter = require('express').Router()
const Phone = require('../models/phone')

phonesRouter.get('/',(request,response) => {
  Phone.find({}).then(result => {
    response.json(result)
  })
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

phonesRouter.delete('/:id',(request,response,next) => {
  const id = request.params.id
  Phone.findByIdAndDelete(id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
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

phonesRouter.post('/',(request,response,next) => {
  const body = request.body

  Phone.findOne({ name: body.name }).then(exists => {
    if (exists){
      return response.status(409).json({ error : 'Already exists' })
    }
    const phone = new Phone({
      'name' : body.name,
      'number': body.number
    })
    phone.save().then(savedPhone => {
      return response.json(savedPhone)
    })
      .catch(error => next(error))
  })

})

module.exports = phonesRouter