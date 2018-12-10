import React, {PropTypes} from 'react';
import {Link} from 'react-router';

export default React.createClass({
  propTypes: {
    componentId: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    className: PropTypes.string,
    children: PropTypes.any
  },

  render() {
    return (
      <Link
        to={this.getRouteName()}
        params={{
          component: this.props.componentId
        }}
        className={this.props.className}
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
