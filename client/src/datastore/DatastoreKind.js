import React, { Component } from 'react'
import { css } from 'glamor'
import { Div } from 'glamorous'
import axios from 'axios'
import { AutoSizer, InfiniteLoader, Column, Table } from 'react-virtualized'
import 'react-virtualized/styles.css'
import { flatMap, sortBy, last } from 'lodash'
import { Button, Checkbox, IconButton, Snackbar } from 'material-ui'
import { Visibility } from '@material-ui/icons'

import ConfirmDialog from '../ConfirmDialog'
import EntityDialog from './EntityDialog'

const renderIdOrName = key => {
  const { id, name } = last(key.path)
  return id ? id : JSON.stringify(name)
}

export default class DatastoreKind extends Component {

  state = {
    entities: null,
    cursor: null,
    moreResults: false,
    columns: [],
    selectedKeys: [],
    promptDelete: false
  }

  componentDidMount() {
    this.runQuery()
  }

  componentDidUpdate({kind}) {
    if(this.props.kind !== kind) {
      this.runQuery()
    }
  }

  runQuery = async () => {
    this.moreResults = true
    this.cursor = undefined
    this.setState({
      entities: null,
      cursor: null,
      moreResults: false,
      columns: [],
      selectedKeys: []
    })
    this.getQueryReqults()
  }

  getQueryReqults = async () => {
    if(!this.moreResults) {
      return
    }
    this.moreResults = false
    this.setState({loading: true})
    const { id, kind, namespace } = this.props
    const { data } = await axios.get(`/datastore/${id}/${namespace}/kinds/${kind}/query`, {
      params: { cursor: this.cursor }
    })
    const entities = data[0]
    const info = data[1]
    const allEntities = [...(this.state.entities || []), ...entities]
    this.moreResults = info.moreResults !== 'NO_MORE_RESULTS' && this.cursor !== info.endCursor
    this.cursor = info.endCursor
    const columns = [...new Set(flatMap(allEntities, entity => Object.keys(entity)))]
    this.setState({
      loading: false,
      entities: allEntities,
      cursor: info.endCursor,
      columns: sortBy(columns).map(key => ({
        dataKey: key,
        label: key === '__key__' ? 'ID/Name' : key,
        width: 200
      }))
    })
  }

  getRowData = i =>
    Object.assign(
      ...Object.entries(this.state.entities[i])
        .map(([key, value]) => ({[key]: key === '__key__' ?
        renderIdOrName(value) : JSON.stringify(value)}))
    )

  deleteEntities = async () => {
    const { entities, selectedKeys } = this.state
    this.setState({
      selectedKeys: [],
      entities: entities.filter(entity => !selectedKeys.includes(entity.__key__)),
      deleting: true
    })
    const { id, namespace } = this.props
    await axios.post(`/datastore/${id}/${namespace}/delete`, selectedKeys)
    this.setState({ deleting: false })
  }

  render() {

    const { columns, entities, selectedKeys, viewedEntity, loading, deleting, promptDelete } = this.state

    return(
      <Div
        flex={1}
        display="flex"
        flexDirection="column"
      >
        <Div>
          <Button
            onClick={() => this.runQuery()}
            color="primary"
          >Refresh</Button>
          <Button
            onClick={() => this.setState({ promptDelete: true })}
            disabled={selectedKeys.length === 0}
            color="primary"
          >Delete</Button>
        </Div>
        <Div
          flex={1}
          fontSize="small"
        >
          {entities &&
            <AutoSizer>
              {({ height, width }) => (
                <InfiniteLoader
                  isRowLoaded={({ index }) => !!entities[index]}
                  loadMoreRows={this.getQueryReqults}
                  rowCount={10000}
                >
                  {({ onRowsRendered, registerChild }) => (
                    <Table
                      headerHeight={30}
                      height={height}
                      onRowsRendered={onRowsRendered}
                      ref={registerChild}
                      rowCount={entities.length}
                      rowGetter={({ index }) => this.getRowData(index)}
                      rowHeight={30}
                      width={width}
                      headerClassName={css({ textTransform: 'none !important' }).toString()}
                      gridClassName={css({ outline: 'none !important' }).toString()}
                    >
                      <Column
                        dataKey="__key__"
                        minWidth={100}
                        width={100}
                        cellRenderer={({rowIndex}) =>
                          <Div display="flex">
                            <Checkbox
                              checked={selectedKeys.includes(entities[rowIndex].__key__)}
                              onChange={() => {
                                const key = entities[rowIndex].__key__
                                this.setState({
                                  selectedKeys: selectedKeys.includes(key) ?
                                    selectedKeys.filter(k => k !== key) :
                                    [...selectedKeys, key]
                                })
                              }}
                              color="primary"
                            />
                            <IconButton onClick={() => this.setState({viewedEntity: entities[rowIndex]})}>
                              <Visibility/>
                            </IconButton>
                          </Div>
                        }
                      />
                      {columns.map(({dataKey, label, width}) =>
                        <Column
                          key={dataKey}
                          dataKey={dataKey}
                          label={label}
                          width={width}
                        />
                      )}
                    </Table>
                  )}
                </InfiniteLoader>
              )}
            </AutoSizer>
          }
        </Div>
        <Snackbar
          anchorOrigin={{vertical: 'top', horizontal: 'center'}}
          open={deleting || loading}
          message={deleting ? 'Deleting...' : 'Loading...'}
        />
        <EntityDialog
          entity={viewedEntity}
          onClose={() => this.setState({viewedEntity: null})}
        />
        <ConfirmDialog
          open={promptDelete}
          text={selectedKeys.length === 1 ? 'Delete entity?' : `Delete ${selectedKeys.length} entities?`}
          confirmLabel="Delete"
          onClose={() => this.setState({promptDelete: false})}
          onConfirm={this.deleteEntities}
        />
      </Div>
    )
  }
}
