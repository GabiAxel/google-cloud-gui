import React, { Component } from 'react'
import { withRouter, Link } from 'react-router-dom'
import { css } from 'glamor'
import { Div } from 'glamorous'
import { FormControl, InputLabel, Select, MenuItem, List, ListItem, ListItemText, Snackbar } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import axios from 'axios'
import { sortBy } from 'lodash'

import DatastoreKind from './DatastoreKind'

class DatastorePage extends Component {

  state = {
    namespaces: [null],
    kinds: []
  }

  componentDidMount() {
    this.loadNamespaces()
    this.loadKinds()
  }

  componentDidUpdate({id, match}) {
    if(this.props.id !== id) {
      this.setState({
        namespaces: [null],
        kinds: []
      })
      this.loadNamespaces()
      this.loadKinds()
    } else if(this.props.match.params.namespace !== match.params.namespace) {
      this.setState({ kinds: [] })
      this.loadKinds()
    }
  }

  loadNamespaces = async () => {
    this.setState({ loadingNamespaces: true })
    const { data } = await axios.get(`/datastore/${this.props.id}/namespaces`)
    this.setState({
      loadingNamespaces: false,
      namespaces: sortBy(data)
    })
  }

  loadKinds = async () => {
    this.setState({ loadingKinds: true })
    const namespace = this.getNamespace() || '[default]'
    const { data } = await axios.get(`/datastore/${this.props.id}/${namespace}/kinds`)
    this.setState({
      loadingKinds: false,
      kinds: sortBy(data)
    })
  }

  getNamespace = () => {
    const namespaceParam = this.props.match.params.namespace
    return (!namespaceParam || namespaceParam === '[default]') ? null : namespaceParam
  }

  render() {

    const { id, kind, theme, history } = this.props
    const namespace = this.getNamespace()
    const { namespaces, kinds, loadingNamespaces, loadingKinds } = this.state

    return(
      <Div
        display="flex"
        height="100%"
      >
        <Div
          display="flex"
          flexDirection="column"
          overflow="auto"
          width={240}
          borderRight={`1px solid ${theme.palette.divider}`}
        >
          <Div padding={10}>
            <FormControl fullWidth>
              <InputLabel shrink htmlFor="namespace">Namespace</InputLabel>
              <Select
                displayEmpty
                value={namespace || ''}
                onChange={e => history.push(`/${id}/${e.target.value || '[default]'}`)}
                inputProps={{name: 'namespace'}}
              >
                {namespaces.map(namespace =>
                  <MenuItem
                    key={namespace}
                    value={namespace || ''}
                  >{namespace || 'Default'}</MenuItem>)
                }
              </Select>
            </FormControl>
          </Div>
          <List dense>
            {kinds.map(k =>
              <ListItem
                key={k}
                button
                component={Link}
                to={`/${id}/${namespace || '[default]'}/${k}`}
                classes={k === kind ? {root: css({backgroundColor: `${theme.palette.action.selected} !important`}).toString()} : undefined}
              ><ListItemText primary={k}/></ListItem>
            )}
          </List>
        </Div>
        {kind &&
          <DatastoreKind
            id={id}
            namespace={namespace}
            kind={kind}
          />
        }
        <Snackbar
          anchorOrigin={{vertical: 'top', horizontal: 'center'}}
          open={loadingNamespaces || loadingKinds}
          message="Loading..."
        />
      </Div>
    )
  }
}

export default withRouter(withStyles(undefined, { withTheme: true})(DatastorePage))
