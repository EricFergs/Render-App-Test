const { test, after, before, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const assert = require('assert')
const api = supertest(app)

const Phone = require('../models/phone')

beforeEach(async () => {
    await Phone.deleteMany({})
    console.log('cleared')
    
    const phoneObjects = helper.initialPhones
        .map(phone => new Phone(phone))
    const promiseArray = phoneObjects.map(phone => phone.save())
    await Promise.all(promiseArray)
})

test('phones are returned as json', async () => {
    console.log('entered test')
    const newPhone = {
        name: 'Async/Await simplifies making async calls',
        number: '89-43243244',
    }
    await api
        .post('/api/persons')
        .send(newPhone)
        .expect(201)
        .expect('Content-Type', /application\/json/)
    
    const phonesAtEnd = await helper.phonesInDb()

    const contents = phonesAtEnd.map(e => e.name)
    assert.strictEqual(phonesAtEnd.length, helper.initialPhones.length +1)

    assert(contents.includes('Async/Await simplifies making async calls'))
})

test('there are two phones', async () => {
    const response = await api.get('/api/persons')
    assert.strictEqual(response.body.length, helper.initialPhones.length)
})

test('the first phone is about HTTP methods',async () => {
    const response = await api.get('/api/persons')

    const contents = response.body.map(e => e.name)
    assert.strictEqual(contents.includes('HTML is easy'), true)

})

test('a specific phone can be viewed', async () => {
    const phonesAtStart = await helper.phonesInDb()

    const phoneToView = phonesAtStart[0]

    const resultPhone = await api
        .get(`/api/persons/${phoneToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)
    
    assert.deepStrictEqual(resultPhone.body, phoneToView)
})

test.only('a note can be deleted', async () => {
    const phonesAtStart = await helper.phonesInDb()
    const phoneToDelete = phonesAtStart[0]
    await api 
        .delete(`/api/persons/${phoneToDelete.id}`)
        .expect(204)
    
    const phonesAtEnd = await helper.phonesInDb()

    const contents = phonesAtEnd.map(r => r.name)
    assert(!contents.includes(phoneToDelete.name))

    assert.strictEqual(phonesAtEnd.length, helper.initialPhones.length -1)
})

after(async () => {
  await mongoose.connection.close()
})