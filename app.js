const config = require('./utils/configs')
const logger = require('./utils/logger')
const express = require('express')
require('express-async-errors')
const app = express()
const phoneRouter = require('./controllers/phones')
const usersRouter = require('./controllers/users')
const middleware = require('./utils/middleware')
const mongoose = require('mongoose')
const morgan = require('morgan')
const loginRouter = require('./controllers/login')

mongoose.set('strictQuery',false)

const url = config.MONGODB_URI

console.log('Connecting to URL')
mongoose.connect(url)
  .then(() => {
    logger.info('conncting to MongoDB')
  })
  .catch(error => {
    logger.info('Error connecting to url', error.message)
  })


app.use(express.json())
app.use(express.static('dist'))
morgan.token('body',(req) => JSON.stringify(req.body) || '{}')
app.use(morgan(':method :url :status :response-time ms :res[content-length] bytes :body'))

app.use('/api/persons', phoneRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app