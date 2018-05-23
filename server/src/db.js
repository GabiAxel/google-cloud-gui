const path = require('path')
const os = require('os')
const lowdb = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const lodashId = require('lodash-id')

const adapter = new FileSync(
  path.join(os.homedir(), '.google-cloud-gui-db.json')
)
const db = lowdb(adapter)
db._.mixin(lodashId)

db.defaults({ projects: [] }).write()

module.exports = {
  projects: db.get('projects')
}
