import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {Link} from 'react-router';

export default (component, configuration, restoreConfigurationCallback) => {
  return createReactClass({
    propTypes: {
      onClick: PropTypes.func.isRequired
    },

    revertConfigRemove: function() {
      restoreConfigurationCallback();
      return this.props.onClick();
    },

    render: function() {
      return (
        <span>
          Configuration {configuration.get('name')} was moved to
          {' '}
          <Link to="settings-trash" onClick={this.props.onClick}>
            Trash
          </Link>.
          {' '}
          <a onClick={this.revertConfigRemove}>
            Restore
          </a>
        </span>
      );
    }
  });
};
