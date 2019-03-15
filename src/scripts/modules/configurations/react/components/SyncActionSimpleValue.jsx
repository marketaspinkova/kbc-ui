import PropTypes from 'prop-types';
import React from 'react';

import createReactClass from 'create-react-class';

import { Loader } from '@keboola/indigo-ui';

export default createReactClass({
  propTypes: {
    action: PropTypes.object.isRequired,
    valueKey: PropTypes.string.isRequired
  },

  renderLoader() {
    if (this.props.action.get('status') === 'pending') {
      return (
        <Loader />
      );
    }
  },

  renderError() {
    if (this.props.action.get('status') === 'error') {
      return this.props.action.get('error');
    }
  },

  renderValue() {
    if (this.props.action.get('status') === 'success') {
      return this.props.action.getIn(['data', this.props.valueKey], 'Unknown');
    }
    if (this.props.action.get('status') === 'none') {
      return 'N/A';
    }
  },

  render() {
    return (
      <span>
        {this.renderLoader()}
        {this.renderError()}
        {this.renderValue()}
      </span>
    );
  }
});

