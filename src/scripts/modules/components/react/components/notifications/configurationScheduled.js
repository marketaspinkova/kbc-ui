import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Link } from 'react-router';

export default (configuration, orchestrationId) => {
  return createReactClass({
    propTypes: {
      onClick: PropTypes.func.isRequired
    },

    render() {
      return (
        <span>
          Configuration {configuration.get('name')} has been{' '}
          <Link to="orchestration" params={{ orchestrationId }} onClick={this.props.onClick}>
            automated
          </Link>
          .
        </span>
      );
    }
  });
};
