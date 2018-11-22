import React from 'react';

export default React.createClass({
  propTypes: {
    runId: React.PropTypes.string
  },

  render() {
    return <span className="kbc-break-all">{this.props.runId}</span>;
  }
});
