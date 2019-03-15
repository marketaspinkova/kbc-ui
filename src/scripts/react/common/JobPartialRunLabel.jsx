import PropTypes from 'prop-types';
import React from 'react';


import createReactClass from 'create-react-class';


export default createReactClass({
  propTypes: {
    job: PropTypes.object.isRequired
  },

  render() {
    if (
      this.props.job.hasIn(['params', 'row'])
      || this.props.job.hasIn(['params', 'transformations']) && this.props.job.getIn(['params', 'transformations']).count() > 0
      || this.props.job.hasIn(['params', 'phases']) && this.props.job.getIn(['params', 'phases']).count() > 0) {
      return (
        <span>
          <span className="label label-default">
            partial
          </span>
          {' '}
        </span>
      );
    }
    return null;
  }
});