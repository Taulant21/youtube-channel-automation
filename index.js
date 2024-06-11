require('dotenv').config()

const server = require('./app/server')
const { startUpload } = require('./app/startUpload')

const isEnabled = process.env.ENABLE_UPLOAD === 'true'

server.listen().then(() => {
  if (isEnabled) {
    startUpload()
  } else {
    console.log('Upload is not enabled in vars')
  }
})
