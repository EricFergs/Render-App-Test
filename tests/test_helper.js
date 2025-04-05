const Phone = require('../models/phone')
const User = require('../models/users')

const initialPhones = [
    {
        name : 'HTML is easy',
        number: '434-432143214'
    },
    {
        name : 'Browser can only execute javascript',
        number: '433-43214431241'
    }
]

const nonExistingId = async () => {
  const phone = new Phone({ name: 'willremovethissoon',phone: '543-54352435' })
  await phone.save()
  await phone.deleteOne()

  return phone._id.toString()
}

const phonesInDb = async () => {
  const phones = await Phone.find({})
  return phones.map(phone => phone.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  initialPhones, nonExistingId, phonesInDb, usersInDb
}