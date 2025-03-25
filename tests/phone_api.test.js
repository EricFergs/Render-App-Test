const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const assert = require('assert')
const api = supertest(app)
const Note = require('../models/phone')

const initialPhones = [
    {
        name : 'HTML is easy',
        phone: '434-432143214'
    },
    {
        name : 'Browser can only execute javascript',
        phone: '433-43214431241'
    }
]

beforeEach(async () => {

})

test('phones are returned as json', async () => {
  await api
    .get('/api/persons')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('there are two phones', async () => {
    const response = await api.get('/api/persons')

    assert.strictEqual(response.body.length, 2)
})

test('the first note is about HTTP methods',async () => {
    const response = await api.get('/api/persons')

    const contents = response.body.map(e => e.name)
    assert.strictEqual(contents.includes('HTML is easy'), true)
})

after(async () => {
  await mongoose.connection.close()
})