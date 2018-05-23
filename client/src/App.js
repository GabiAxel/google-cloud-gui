import React from 'react'
import { BrowserRouter, Route } from 'react-router-dom'

import ProjectList from './ProjectList'

export default () => (
  <BrowserRouter>
    <Route path="/:id?/:namespace?/:kind?" component={ProjectList} />
  </BrowserRouter>
)
