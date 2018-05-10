const path = require('path')
const { readFileSync } = require('fs')
const server = require('server')
const { argv } = require('yargs')
const opn = require('opn')

const { send } = server.reply

const port = argv.port || 8000

const index = (() => {
  try {
    return readFileSync(path.join(__dirname, 'public', 'index.html'), { encoding: 'UTF-8' })
  } catch(e) {
    return ''
  }
})()

server({
  port,
  security: false,
  public: path.join(__dirname, 'public')
},
require('./projects'),
require('./datastore'),
() => send(index))

if(!argv.skipBrowser) {
  opn(`http://localhost:${port}`)
}
