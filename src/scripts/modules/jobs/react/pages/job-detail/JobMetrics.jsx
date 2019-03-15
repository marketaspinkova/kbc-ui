import PropTypes from 'prop-types';
import React from 'react';
import CreditSize from '../../../../../react/common/CreditSize';

export default React.createClass({

  propTypes: {
    metrics: PropTypes.object.isRequired
  },

  render() {
    if (!this.props.metrics.isEmpty()) {
      return (
        <div>
          <h4>Project Power</h4>
          <p className="text-center">
            {
              this.renderSize(
                this.props.metrics.get('storage').get('inBytes')
                + this.props.metrics.get('storage').get('outBytes')
              )
            }
          </p>
          <p>
            <small>
              <i className="fa fa-info-circle" />
              {' '}
              The shown number is processed asynchronously and may keep changing until processing is done.
            </small>
          </p>
        </div>
      );
    } else {
      return null;
    }
  },

  renderSize(nanoCredits) {
    if (nanoCredits !== 0) {
      return (
        <CreditSize nanoCredits={nanoCredits}/>
      );
    } else {
      return (
        '0 credits'
      );
    }
  }

});
