import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {Link} from 'react-router';
import componentNameAsString from '../../../../../react/common/componentNameAsString';

export default (component, jobId) => {
  return createReactClass({
    propTypes: {
      onClick: PropTypes.func.isRequired
    },

    getJobName() {
      if (component) {
        return componentNameAsString(component, {showType: true}) + ' job';
      } else {
        return 'Job';
      }
    },

    render() {
      return (
        <span>
          <Link to="jobDetail" params={{jobId: jobId}} onClick={this.props.onClick}>
            {this.getJobName()}
          </Link>
          {' '}
          has been scheduled.
        </span>
      );
    }
  });
};

