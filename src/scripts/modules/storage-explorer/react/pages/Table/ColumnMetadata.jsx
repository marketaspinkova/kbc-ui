import React, { PropTypes } from 'react';

export default React.createClass({
  propTypes: {
    column: PropTypes.object.isRequired,
    columnMetadata: PropTypes.object.isRequired
  },

  render: function() {
    return <div>{this.props.columnMetadata}</div>;
  }
});
