import React, { Component } from 'react'
import { Drawer, AppBar, Toolbar, List, ListItem, ListItemText, ListItemSecondaryAction, Divider, Typography, IconButton } from '@material-ui/core'
import { ChevronLeft, Menu, AddCircle, Delete } from '@material-ui/icons'
import { withStyles } from '@material-ui/core/styles'
import { css } from 'glamor'
import { Div } from 'glamorous'
import { sortBy } from 'lodash'
import axios from 'axios'
import { Link } from 'react-router-dom'

import DatastorePage from './datastore/DatastorePage'
import ProjectDialog from './ProjectDialog'
import ConfirmDialog from './ConfirmDialog'

const styles = theme => ({
  content: {
    flexGrow: 1,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  }
})

class ProjectList extends Component {

  state = {
    projects: [],
    drawerOpen: true,
    projectDialogOpen: false,
    removeId: null
  }

  async componentDidMount() {
    const { data } = await axios.get('/projects')
    this.setState({projects: sortBy(data, 'projectId', 'apiEndpoint')})
  }

  addProject = project => {
    this.setState({projects: sortBy([...this.state.projects, project], 'projectId', 'apiEndpoint')})
    this.props.history.push(`/${project.id}`)
  }

  removeProject = async id => {
    await axios.post(`/projects/${id}/remove`)
    this.setState({
      projects: this.state.projects.filter(p => p.id !== id)
    })
    const { match, history } = this.props
    if(match.params.id === id) {
      history.push('/')
    }
  }

  render() {

    const { projects, drawerOpen, projectDialogOpen, removeId } = this.state
    const { match, classes } = this.props
    const { id, kind } = match.params
    const project = id ? projects.find(p => p.id === id) : undefined

    return (
      <Div
        position="absolute"
        top={0}
        bottom={0}
        left={0}
        right={0}
      >
        <Drawer
          variant="persistent"
          open={drawerOpen}
          classes={{paper: css({width: 240}).toString()}}
        >
          <Toolbar disableGutters>
            <IconButton
              onClick={() => this.setState({projectDialogOpen: true})}
              color="primary"
            ><AddCircle/></IconButton>
            <Typography
              variant="subheading"
              color="inherit"
              className={css({flex: 1}).toString()}
            >Projects</Typography>
            <IconButton onClick={() => this.setState({drawerOpen: false})}>
              <ChevronLeft/>
            </IconButton>
          </Toolbar>
          <Divider/>
          <List classes={{root: css({flex: 1}).toString()}}>
            {projects.map(({id, projectId, apiEndpoint}) =>
              <ListItem
                key={id}
                button
                component={Link}
                to={`/${id}/[default]`}
              >
                <ListItemText
                  primary={projectId}
                  secondary={apiEndpoint}
                />
                <ListItemSecondaryAction>
                  <IconButton onClick={() => this.setState({removeId: id})}>
                    <Delete/>
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            )}
          </List>
        </Drawer>
        <Div
          display="flex"
          flexDirection="column"
          height="100%"
          overflow="hidden"
          marginLeft={drawerOpen ? 240 : undefined}
          className={classes.content}
        >
          <AppBar
            position="static"
            color="default"
          >
            <Toolbar>
              {!drawerOpen &&
                <IconButton onClick={() => this.setState({drawerOpen: true})}>
                  <Menu/>
                </IconButton>
              }
              <Typography variant="title">
                {project ? `${project.projectId} ${project.apiEndpoint ? ` / ${project.apiEndpoint}` : ''}` : 'Google Cloud GUI'}
              </Typography>
            </Toolbar>
          </AppBar>
          <Div
            flex={1}
            overflow="hidden"
          >
            {project &&
              <DatastorePage
                id={project.id}
                kind={kind}
              />}
          </Div>
        </Div>
        <ProjectDialog
          open={projectDialogOpen}
          onClose={() => this.setState({projectDialogOpen: false})}
          onSaved={this.addProject}
        />
        <ConfirmDialog
          open={!!removeId}
          text={!!removeId && `Remove the project ${projects.find(({id}) => id === removeId).projectId} from the list?`}
          confirmLabel="Remove"
          onClose={() => this.setState({removeId: null})}
          onConfirm={() => this.removeProject(removeId)}
        />
      </Div>
    )
  }
}

export default withStyles(styles)(ProjectList)
