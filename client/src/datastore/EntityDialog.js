import React from 'react'
import { Dialog, DialogActions, DialogContent, Button } from 'material-ui'
import { css } from 'glamor'
import { sortBy } from 'lodash'

export default ({entity, onClose}) =>
<Dialog
  open={!!entity}
  onClose={onClose}
>
  <DialogContent>
    {entity &&
      <table className={css({
        ' td:first-child': {
          paddingRight: 20
        }
      }).toString()}>
        <tbody>
          {sortBy(Object.entries(entity), ([key]) => key).map(([key, value]) =>
            <tr key={key}>
              <td>{key}</td>
              <td>{JSON.stringify(value)}</td>
            </tr>
          )}
        </tbody>
      </table>
    }
  </DialogContent>
  <DialogActions>
    <Button
      onClick={onClose}
      color="primary"
    >Close</Button>
  </DialogActions>
</Dialog>
