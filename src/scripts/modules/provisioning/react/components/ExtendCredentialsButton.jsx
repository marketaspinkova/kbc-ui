import React from 'react';
import {Loader} from '@keboola/indigo-ui';

export default React.createClass({
  propTypes: {
    isExtending: React.PropTypes.bool.isRequired,
    onExtend: React.PropTypes.func.isRequired,
    disabled: React.PropTypes.bool.isRequired
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

