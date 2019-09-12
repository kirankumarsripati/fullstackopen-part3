require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const Person = require('./models/person')

app.use(bodyParser.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :raw-data'))

morgan.token('raw-data', (request, response) => JSON.stringify(request.body))

app.use(express.static('build'))

app.get('/api/persons', (request, response, next) => {
  Person.find({}).then(persons => {
    response.json(persons.map(person => person.toJSON()))
  })
  .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person.toJSON())
    } else {
      response.status(404).end()
    }
  })
  .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
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
  .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id).then(returnedObject => {
    response.status(204).end()
  })
  .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body
  const person = { name, number }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(returnedObject => {
      response.json(returnedObject.toJSON())
    })
    .catch(error => next(error))
})

app.get('/info', (request, response, next) => {
  Person.find({}).count().then(count => {
    let info = `<p>Phonebook has info for ${count} people`
    info += `<br>${new Date()}</p>`
    response.send(info)
  })
  .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

// handler of requests with result to errors
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT)
console.log(`Server running on port ${PORT}`)