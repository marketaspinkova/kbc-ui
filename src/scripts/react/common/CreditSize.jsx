import PropTypes from 'prop-types';
import React from 'react';

import createReactClass from 'create-react-class';

export function convertToCredits(nanoCredits, precision) {
  return Number(nanoCredits / (1000 * 1000 * 1000)).toFixed(precision);
}

export default createReactClass({
  propTypes: {
    nanoCredits: PropTypes.number
  },

  render() {
    if (this.props.nanoCredits) {
      if (this.props.nanoCredits < 1000) {
        return (
          <span>
            {convertToCredits(this.props.nanoCredits, 9) + ' credits'}
          </span>
        );
      } else if (this.props.nanoCredits < 1000000) {
        return (
          <span>
            {convertToCredits(this.props.nanoCredits, 6) + ' credits'}
          </span>
        );
      } else {
        return (
          <span>
            {convertToCredits(this.props.nanoCredits, 3) + ' credits'}
          </span>
        );
      }
    } else {
      return (
        <span>
          N/A
        </span>
      );
    }
  }

});
