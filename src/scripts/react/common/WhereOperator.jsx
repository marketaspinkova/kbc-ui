import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import whereOperatorConstants from './whereOperatorConstants';

export default createReactClass({
  propTypes: {
    backendOperator: PropTypes.string
  },

  render() {
    if (this.props.backendOperator === whereOperatorConstants.NOT_EQ_VALUE) {
      return <span>{whereOperatorConstants.NOT_EQ_LABEL}</span>;
    } else {
      return <span>{whereOperatorConstants.EQ_LABEL}</span>;
    }
  }
});
