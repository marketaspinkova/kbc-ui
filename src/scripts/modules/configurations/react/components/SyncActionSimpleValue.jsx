import React from 'react';

import { Loader } from '@keboola/indigo-ui';

export default React.createClass({
  propTypes: {
    action: React.PropTypes.object.isRequired,
    valueKey: React.PropTypes.string.isRequired
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

