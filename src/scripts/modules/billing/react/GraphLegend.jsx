import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import CreditSize from '../../../react/common/CreditSize';

export default createReactClass({
  propTypes: {
    value: PropTypes.number.isRequired
  },

  render() {
    return (
      <div className="text-center">
        <h4>
          Total <CreditSize nanoCredits={this.props.value}/>
        </h4>
      </div>
    );
  }
});
