import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {Link} from 'react-router';

export default (configuration) => {
  return createReactClass({
    propTypes: {
      onClick: PropTypes.func.isRequired
    },

    render: function() {
      return (
        <span>
          Configuration {configuration.get('name')} was moved to
          {' '}
          <Link to="settings-trash" onClick={this.props.onClick}>
            Trash
          </Link>.
        </span>
      );
    }
  });
};
