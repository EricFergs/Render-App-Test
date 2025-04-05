const { test, after, before, beforeEach, describe} = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const assert = require('assert')
const api = supertest(app)
const User = require('../models/users')
const Phone = require('../models/phone')
const bcrypt = require('bcrypt')

describe('phone tests', ()=>{
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
    
    test('a note can be deleted', async () => {
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
})
describe.only('when there is initally one user in db',() => {
    beforeEach(async () => {
        await User.deleteMany({})
    
        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })
    
        await user.save()
      })
    
      test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDb()
    
        const newUser = {
          username: 'mluukkai',
          name: 'Matti Luukkainen',
          password: 'salainen',
        }
    
        await api
          .post('/api/users')
          .send(newUser)
          .expect(201)
          .expect('Content-Type', /application\/json/)
    
        const usersAtEnd = await helper.usersInDb()
        assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)
    
        const usernames = usersAtEnd.map(u => u.username)
        assert(usernames.includes(newUser.username))
    })
    test('creation fails with proper statuscode and message if username already taken', async () => {
        const usersAtStart = await helper.usersInDb()
    
        const newUser = {
          username: 'root',
          name: 'Superuser',
          password: 'salainen',
        }
    
        const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
          .expect('Content-Type', /application\/json/)
    
        const usersAtEnd = await helper.usersInDb()
        assert(result.body.error.includes('expected `username` to be unique'))
    
        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })
})

after(async () => {
  await mongoose.connection.close()
})