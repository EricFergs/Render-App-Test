const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()


app.use(cors())
app.use(express.json())
app.use(express.static('dist'))
morgan.token('body',(req) => JSON.stringify(req.body) || '{}')
app.use(morgan(':method :url :status :response-time ms :res[content-length] bytes :body'))


const requestLogger = (request,response,next) => {
    console.log('Method:', request.method)
    console.log('Path: ', request.path)
    console.log('Body: ',request.body)
    console.log('---')
    next()
}
const unknownEndpoint = (request,response) => {
    response.status(404).send({error: 'unknown endpoint'})
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
    response.json(data)
})

app.get('/info',(request,response) => {
    const length = data.length
    const dateTime = new Date().toISOString()
    response.send(`<p>The phone book has ${length} many people <br/><br/> ${dateTime}</p>`)
})

app.get('/api/persons/:id',(request,response) => {
    const id = request.params.id
    const person = data.find(p => p.id === id)
    if (person){
        return response.json(person)
    }
    return response.status(404).end()
})

app.delete('/api/persons/:id',(request,response) => {
    const id = request.params.id
    data = data.filter(p => p.id !== id)
    response.status(204).end()
})

app.put('/api/persons',(request,response) => {
    const body = request.body
    if(!body.number || !body.id){
        return response.status(404).json({
            error : "Missing body"
        })
    }
    const id = body.id
    const person = data.find(p => p.id === id)
    if (person){
        person.number = body.number
        data.map(p => p.id === id ? person : p)
        return response.json(person)
    }
    return response.status(404).json({error : "Person not found"})
})

const randomNumber = () => {
    return String(Math.floor(Math.random() * 10000) + 1)
}
app.post('/api/persons',(request,response) => {
    const body = request.body
    if(!body.name || !body.number){
        return response.status(404).json({
            error : "Mising body or number"
        })
    }
    const person = data.find(p => p.name === body.name)

    if(person){ 
        return response.status(404).json({
            error: "Person already exists"
        })
    }
    const newPerson = {
        "id" : randomNumber(),
        "name" : body.name,
        "number": body.number
    }
    data = data.concat(newPerson)
    return response.json(newPerson)
})



app.use(unknownEndpoint)

const PORT =  process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})