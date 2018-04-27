const { get, post } = require('server/router')
const { json, status } = require('server/reply')

const { projects } = require('./db')

module.exports = [
  get('/projects', () => json(projects.value())),
  post('/projects', ({ data: { projectId, apiEndpoint } }) => {
    const project = projects.insert({
      service: 'datastore',
      projectId,
      apiEndpoint
    }).write()
    return json(project)
  }),
  post('/projects/:id/remove', ({ params: { id } }) => {
    projects.removeById(id).write()
    return status(200)
  })
]
