import PropTypes from 'prop-types';
import React from 'react';

import createReactClass from 'create-react-class';

export default createReactClass({
  propTypes: {
    runId: PropTypes.string
  },

  render() {
    return <span className="kbc-break-all">{this.props.runId}</span>;
  }
});
