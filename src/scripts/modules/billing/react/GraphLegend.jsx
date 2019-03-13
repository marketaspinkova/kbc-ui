import PropTypes from 'prop-types';
import React from 'react';
import CreditSize from '../../../react/common/CreditSize';

export default React.createClass({

  propTypes: {
    title: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired
  },

  render: function() {
    return (
      <div className="text-center">
        <h4>
          Total <CreditSize nanoCredits={this.props.value}/>
        </h4>
      </div>
    );
  }

});
