const express = require('express')
const morgan = require('morgan')
const app = express()
const Phone = require('./models/phone')
require('dotenv').config();

const requestLogger = (request,response,next) => {
    console.log('Method:', request.method)
    console.log('Path: ', request.path)
    console.log('Body: ',request.body)
    console.log('---')
    next()
}


app.use(express.json())
// app.use(requestLogger)
app.use(express.static('dist'))
morgan.token('body',(req) => JSON.stringify(req.body) || '{}')
app.use(morgan(':method :url :status :response-time ms :res[content-length] bytes :body'))


const unknownEndpoint = (request,response) => {
    response.status(404).send({error: 'unknown endpoint'})
}

const errorHandler = (error, request, response, next) => {
    console.log(error.message)
    if (error.name === 'CastError') {
        return response.status(400).send({error: 'malformatted id'})
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({error: error.message})
    }

    next(error)
}
// app.use(requestLogger)


data = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons',(request,response) => {
    Phone.find({}).then(result => {
        response.json(result)
    })
})

app.get('/info',(request,response) => {
    const length = data.length
    const dateTime = new Date().toISOString()
    response.send(`<p>The phone book has ${length} many people <br/><br/> ${dateTime}</p>`)
})

app.get('/api/persons/:id',(request,response,next) => {
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

app.delete('/api/persons/:id',(request,response,next) => {
    const id = request.params.id
    Phone.findByIdAndDelete(id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.put('/api/persons',(request,response, next) => {
    const {name, number, id} = request.body
    if(!name || !number){
        return response.status(404).json({
            error : "Mising body or number"
        })
    }
    Phone.findById(id)
        .then(phone => {
            if (!phone) {
                return response.status(404).json({error: "The person does not exists anymore"})
            }

            phone.name = name
            phone.number = number

            return phone.save().then((updatedPhone => {
                response.json(updatedPhone)
            }))
        })
        .catch(error => next(error))
})

app.post('/api/persons',(request,response,next) => {
    const body = request.body
   
    Phone.findOne({name: body.name}).then(exists => {
        if (exists){
            return response.status(409).json({error : "Already exists"})
        }
        const phone = new Phone({
            "name" : body.name,
            "number": body.number
        })
        phone.save().then(savedPhone => {
            return response.json(savedPhone)
        })
        .catch(error=>next(error))
    })
    
})



app.use(unknownEndpoint)

app.use(errorHandler)

const PORT =  process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})