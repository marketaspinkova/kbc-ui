import PropTypes from 'prop-types';
import React from 'react';
import {Link} from 'react-router';

export default React.createClass({
  propTypes: {
    query: PropTypes.object.isRequired,
    configurationId: PropTypes.string.isRequired,
    componentId: PropTypes.string.isRequired
  },

  render() {
    return (
      <Link
        className="list-group-item"
        to={`${this.props.componentId}-query-detail`}
        params={this.linkParams()}
      >
        <strong>{this.props.query.get('name')}</strong>
      </Link>
    );
  },

  linkParams() {
    return {
      config: this.props.configurationId,
      queryId: this.props.query.get('id')
    };
  }
});
