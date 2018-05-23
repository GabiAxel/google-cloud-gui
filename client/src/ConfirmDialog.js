import React from 'react'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Button
} from '@material-ui/core'

export default ({ open, onClose, text, onConfirm, confirmLabel }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogContent>
      <DialogContentText>{text}</DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button
        onClick={() => {
          onConfirm()
          onClose()
        }}
        color="primary"
      >
        {confirmLabel}
      </Button>
      <Button onClick={onClose}>Cancel</Button>
    </DialogActions>
  </Dialog>
)
