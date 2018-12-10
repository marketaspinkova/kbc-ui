import React, { PropTypes } from 'react';
import LimitRow from './LimitRow';

export default React.createClass({
  propTypes: {
    section: PropTypes.object.isRequired,
    keenClient: PropTypes.object.isRequired,
    isKeenReady: PropTypes.bool,
    canEdit: PropTypes.bool
  },

  render() {
    const showOnLimitsPage = this.props.section.get('limits').filter(limit => {
      return limit.get('showOnLimitsPage', true);
    });

    return (
      <div className="kbc-limits-section">
        <div className="kbc-header">
          <div className="kbc-title">
            <h2>
              <span className="kb-sapi-component-icon">
                <img src={this.props.section.get('icon')} width="32" height="32" />
              </span>
              {this.props.section.get('title')}
            </h2>
          </div>
        </div>
        <div className="components-overview-grid">
          {showOnLimitsPage.map((limit) => {
            return (
              <LimitRow
                limit={limit}
                isKeenReady={this.props.isKeenReady}
                keenClient={this.props.keenClient}
                canEdit={this.props.canEdit}
                key={limit.get('id')}
              />
            );
          })}
        </div>
      </div>
    );
  }
});
