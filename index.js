require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const Person = require('./models/person')

app.use(bodyParser.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :raw-data'))

morgan.token('raw-data', (request, response) => JSON.stringify(request.body))

let persons =  [
  {
    "name": "Arto Hellas",
    "number": "040-123456",
    "id": 1
  },
  {
    "name": "Ada Lovelace",
    "number": "39-44-5323523",
    "id": 2
  },
  {
    "name": "Dan Abramov",
    "number": "12-43-234345",
    "id": 3
  },
  {
    "name": "Mary Poppendieck",
    "number": "39-23-6423122",
    "id": 4
  }
]

app.use(express.static('build'))

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons.map(person => person.toJSON()))
  })
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    response.json(person.toJSON())
  })
})

app.post('/api/persons', (request, response) => {
  const name = request.body.name ? request.body.name.trim() : ''
  const number = request.body.number ? request.body.number.trim() : ''

  if (name === '') {
    return response.status(400).json({
      error: 'name missing'
    })
  }

  if (number === '') {
    return response.status(400).json({
      error: 'number missing'
    })
  }

  const person = new Person({ name, number })

  person.save().then(returnedObject => {
    response.json(returnedObject.toJSON())
  })
})

app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndRemove(request.params.id).then(returnedObject => {
    response.status(204).end()
  })
})

app.get('/info', (request, response) => {
  let info = `<p>Phonebook has info for ${persons.length} people`
  info += `<br>${new Date()}</p>`
  response.send(info)
})

const PORT = process.env.PORT
app.listen(PORT)
console.log(`Server running on port ${PORT}`)