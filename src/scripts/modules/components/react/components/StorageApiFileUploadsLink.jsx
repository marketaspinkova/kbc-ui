import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Link } from 'react-router';

export default createReactClass({
  propTypes: {
    children: PropTypes.any.isRequired
  },

  render() {
    return <Link to="storage-explorer-files">{this.props.children}</Link>;
  }
});
