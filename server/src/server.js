const path = require('path')
const server = require('server')
const { argv } = require('yargs')
const opn = require('opn')

const port = argv.port || 8000

server({
  port,
  security: false,
  public: path.join(__dirname, 'public')
},
require('./projects'),
require('./datastore'))

if(!argv.skipBrowser) {
  opn(`http://localhost:${port}`)
}
