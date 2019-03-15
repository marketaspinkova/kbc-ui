import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {Loader} from '@keboola/indigo-ui';

export default createReactClass({
  propTypes: {
    isExtending: PropTypes.bool.isRequired,
    onExtend: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  render: function() {
    if (!this.props.isExtending) {
      return (
        <button className="btn btn-link" title="Extend" type="submit" onClick={this.props.onExtend} disabled={this.props.disabled}>
          <span className="fa fa-fw fa-clock-o"/> Extend expiration
        </button>
      );
    } else {
      return (
        <button className="btn btn-link" title="Extend" type="submit" disabled>
          <Loader className="fa-fw"/> Extending
        </button>
      );
    }
  }
});

