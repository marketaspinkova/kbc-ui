import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {Link} from 'react-router';

export default createReactClass({
  propTypes: {
    componentId: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    children: PropTypes.any
  },

  render() {
    return (
      <Link
        to={this.getRouteName()}
        params={{
          component: this.props.componentId
        }}
        className="td"
      >
        {this.props.children}
      </Link>
    );
  },

  getRouteName() {
    if (this.props.type === 'extractor') {
      return 'generic-detail-extractor';
    }
    if (this.props.type === 'writer') {
      return 'generic-detail-writer';
    }
    return 'generic-detail-application';
  }
});
