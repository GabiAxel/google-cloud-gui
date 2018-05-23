import React, { Component } from 'react'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField
} from '@material-ui/core'
import axios from 'axios'

export default class ProjectDialog extends Component {
  state = {
    projectId: '',
    apiEndpoint: ''
  }

  static getDerivedStateFromProps({ open: nextOpen }, { open: prevOpen }) {
    if (nextOpen && !prevOpen) {
      return {
        projectId: '',
        apiEndpoint: ''
      }
    }
    return null
  }

  saveConnection = async () => {
    const { onClose, onSaved } = this.props
    const { projectId, apiEndpoint } = this.state
    onClose()
    const { data } = await axios.post('/projects', { projectId, apiEndpoint })
    onSaved(data)
  }

  render() {
    const { open, onClose } = this.props
    const { projectId, apiEndpoint } = this.state

    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>New Project Connection</DialogTitle>
        <DialogContent>
          <TextField
            value={projectId}
            onChange={e => this.setState({ projectId: e.target.value })}
            autoFocus
            label="Project ID (required)"
            fullWidth
          />
          <TextField
            value={apiEndpoint}
            onChange={e => this.setState({ apiEndpoint: e.target.value })}
            type="url"
            label="API endpoint (eg. emulator host:port, optional)"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={this.saveConnection}
            disabled={!projectId}
            color="primary"
          >
            Save
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    )
  }
}
