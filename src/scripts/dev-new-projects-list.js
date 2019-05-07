import React from 'react';
import ReactDOM from 'react-dom';
import { fromJS } from 'immutable';
import * as helpers from './helpers';
import ProjectsList from './react/admin/projects-list/Index';

import '../styles/app.less';

export default {
  loginPage: true,
  start: function(app) {
    ReactDOM.render(
      <ProjectsList
        user={fromJS(app.data.kbc.admin)}
        maintainers={fromJS(app.data.maintainers)}
        organizations={fromJS(app.data.organizations)}
        urlTemplates={fromJS(app.data.kbc.urlTemplates)}
      />,
      document.getElementById('react')
    );
  },
  helpers
};
