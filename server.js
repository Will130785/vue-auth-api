'use strict'
const express = require('express')
const DB = require('./config/db')
const config = require('./config/config')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const User = require('./models/User')

const app = express()
const router = express.Router()

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

// CORS middleware
const allowCrossDomain = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', '*')
  res.header('Access-Control-Allow-Headers', '*')
  next()
}

app.use(allowCrossDomain)

// Inititate db
DB('mongodb://localhost/vue-auth')

router.post('/register', function (req, res) {
  const data = {
    name: req.name,
    email: req.email,
    password: bcrypt.hashSync(req.body.password, 8)
  }
  User.create(data, function (err) {
    if (err) {
      return res.status(500).send('There was a problem registering the user')
    } else {
      User.findOne({ username: data.username }, (err, user) => {
        if (err) {
          return res.status(500).send('There was a problem getting the user')
        } else {
          const token = jwt.sign({ id: user._id }, config.secret, { expiresIn: 86400 })
          res.status(200).send({ auth: true, token: token, user: user })
        }
      })
    }
  })
})

router.post('/register-admin', function (req, res) {
  const data = {
    name: req.body.name,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
    isAdmin: 1
  }
  User.create(data, function (err) {
    if (err) {
      return res.status(500).send('There was a problem registering the user')
    } else {
      User.findOne(req.body.email, (err, user) => {
        if (err) {
          return res.status(500).send('There was a problem getting the user')
        } else {
          const token = jwt.sign({ id: user._id }, config.secret, { expiresIn: 86400 })
          res.status(200).send({ auth: true, token: token, user: user })
        }
      })
    }
  })
})

router.post('/login', (req, res) => {
  User.findOne(req.body.email, (err, user) => {
    if (err) {
      return res.status(500).send('Error on the server')
    }
    if (!user) {
      return res.status(404).send('No user found')
    }
    const passwordIsValid = bcrypt.compareSync(req.body.password, user.password)
    if (!passwordIsValid) {
      return res.status(400).send({ auth: false, token: null })
    }
    const token = jwt.sign({ id: user._id }, config.secret, { expiresIn: 86400 })
    res.status(200).send({ auth: true, token: token, user: user })
  })
})

app.use(router)

const port = process.env.PORT || 3000

app.listen(port, function () {
  console.log(`Express server listening on port ${port}`)
})
