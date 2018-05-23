import React from 'react'
import { Dialog, DialogActions, DialogContent, Button } from '@material-ui/core'
import { chain } from 'lodash'
import ReactJson from 'react-json-view'

export default ({ entity, onClose }) => (
  <Dialog open={!!entity} onClose={onClose}>
    <DialogContent>
      {entity && (
        <ReactJson
          src={chain(entity)
            .toPairs()
            .sortBy(([key]) => key)
            .fromPairs()
            .value()}
          name={false}
          enableClipboard={false}
          displayDataTypes={false}
          displayObjectSize={false}
          style={{ width: 500 }}
        />
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary">
        Close
      </Button>
    </DialogActions>
  </Dialog>
)
