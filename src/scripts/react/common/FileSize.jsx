import React from 'react';
import fileSize from 'filesize';
import { NotAvailable } from '@keboola/indigo-ui';

export default React.createClass({
  propTypes: {
    size: React.PropTypes.number
  },

  render() {
    return (
      this.props.size ? fileSize(this.props.size) : <NotAvailable/>
    );
  }

});