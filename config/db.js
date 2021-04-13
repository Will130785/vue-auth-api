const mongoose = require('mongoose')

const db = function (connect) {
  mongoose.connect(connect, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })

  const connection = mongoose.connection
  connection.on('error', function () {
    console.log('Connection error')
  })
  connection.once('open', function () {
    console.log('Connected to database')
  })
}

module.exports = db
