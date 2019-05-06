import React from 'react';
import ReactDOM from 'react-dom';
import * as helpers from './helpers';
import Login from './react/admin/login';

import '../styles/app.less';

export default {
  loginPage: true,
  start: function() {
    ReactDOM.render(<Login />, document.getElementById('react'));
  },
  helpers
};
