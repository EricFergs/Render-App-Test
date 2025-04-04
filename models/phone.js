const mongoose = require('mongoose')

const phoneSchema = new mongoose.Schema({
  id: Number,
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    minLength: 8,
    required: true,
    validate:{
      validator : function(value) {
        hasDash = false
        for(let i = 0; i < value.length; i ++){
          if ((i == 2 || i == 3) && value[i] === '-'){
            hasDash = !hasDash
          }
          else if (isNaN(value[i])) {
            return false
          }
        }
        if (hasDash){
          return true
        }
        return false
      },
      message: props => `${props.value} is not valid phone number`
    }

  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }

})

phoneSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Phone',phoneSchema)

