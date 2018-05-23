const { get, post } = require('server/router')
const { json, status } = require('server/reply')
const Datastore = require('@google-cloud/datastore')
const { keyToKeyProto } = require('@google-cloud/datastore/src/entity')

const { projects } = require('./db')

const datastores = {}

const getDatastore = (id, namespaceParam) => {
  const namespace =
    !namespaceParam || namespaceParam === '[default]' ? null : namespaceParam
  let namespaces = datastores[id]
  if (!namespaces) {
    namespaces = {}
    datastores[id] = namespaces
  }
  let datastore = namespaces[namespace]
  if (!datastore) {
    const project = projects.getById(id).value()
    datastore = new Datastore({
      projectId: project.projectId,
      namespace: namespace || null,
      apiEndpoint: project.apiEndpoint || undefined
    })
    namespaces[namespace] = datastore
  }
  return datastore
}

module.exports = [
  get('/datastore/:id/namespaces', async ({ params: { id } }) => {
    const datastore = getDatastore(id)
    const query = datastore.createQuery('__namespace__').select('__key__')
    const results = await datastore.runQuery(query)
    const namespaces = results[0].map(entity => entity[datastore.KEY].name)
    return json(namespaces)
  }),
  get(
    '/datastore/:id/:namespace/kinds',
    async ({ params: { id, namespace } }) => {
      const datastore = getDatastore(id, namespace)
      const query = datastore.createQuery('__kind__').select('__key__')
      const results = await datastore.runQuery(query)
      const kinds = results[0].map(entity => entity[datastore.KEY].name)
      return json(kinds)
    }
  ),
  get(
    '/datastore/:id/:namespace/kinds/:kind/query',
    async ({ params: { id, namespace, kind }, query: { cursor } }) => {
      const datastore = getDatastore(id, namespace)
      const query = datastore
        .createQuery(kind)
        .limit(100)
        .start(cursor || null)
      const results = await datastore.runQuery(query)
      results[0].forEach(
        entity => (entity.__key__ = keyToKeyProto(entity[datastore.KEY]))
      )
      return json(results)
    }
  ),
  post(
    '/datastore/:id/:namespace/delete',
    async ({ params: { id, namespace }, data }) => {
      const datastore = getDatastore(id, namespace)
      const keys = data.map(({ path }) =>
        datastore.key(
          path
            .map(({ kind, id, name }) => [
              kind,
              id ? datastore.intValue(id) : name
            ])
            .reduce((a, b) => [...a, ...b], [])
        )
      )
      await datastore.delete(keys)
      return status(200)
    }
  )
]
