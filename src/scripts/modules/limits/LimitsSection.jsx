import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import LimitRow from './LimitRow';

function limitsToRows(limits) {
  return limits.toIndexedSeq().groupBy((limit, i) => Math.floor(i / 3));
}

export default createReactClass({
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

    const rows = limitsToRows(showOnLimitsPage)
      .map(this.limitsRow)
      .toArray();

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
        <div className="table kbc-table-border-vertical kbc-components-overview kbc-layout-table">
          <div className="tbody">{rows}</div>
        </div>
      </div>
    );
  },

  limitsRow(limitsPart, index) {
    const tds = limitsPart
      .filter((limit) => !!limit.get('name'))
      .map((limit) => {
        return (
          <LimitRow
            key={limit.get('id')}
            limit={limit}
            isKeenReady={this.props.isKeenReady}
            keenClient={this.props.keenClient}
            canEdit={this.props.canEdit}
          />
        );
      })
      .toArray();

    return (
      <div className="tr" key={index}>
        {tds}
      </div>
    );
  }
});
