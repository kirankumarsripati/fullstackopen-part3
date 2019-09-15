const mongoose = require('mongoose')

const args = process.argv

if (args.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://fullstack:${password}@cluster0-9k4dk.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true })

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (args.length === 3) {
  // only password provided
  Person.find({}).then((result) => {
    console.log('phonebook:')
    result.forEach((person) => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })
}

if (args.length === 4) {
  console.log('required both name and number')
  process.exit(1)
}

if (args.length === 5) {
  const person = new Person({
    name: args[3],
    number: args[4],
  })

  person.save().then((response) => {
    console.log(`added ${response.name} ${response.number} to phonebook`)
    mongoose.connection.close()
  })
}
