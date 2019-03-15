import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {Image} from 'react-bootstrap';
import ApplicationStore from '../../../stores/ApplicationStore';


export default createReactClass({
  propTypes: {
    currentBadge: PropTypes.number,
    badgeCount: PropTypes.number
  },
  getImagePath() {
    return ApplicationStore.getScriptsBasePath() + require('../media/kblw.png');
  },
  renderActiveItem(order) {
    if (order < this.props.currentBadge) {
      return (
        <div className="guide-timeline-circle-item guide-timeline-circle-active">
          <Image src={this.getImagePath()}/>
        </div>
      );
    } else {
      return null;
    }
  },
  getItems() {
    var rows = [];
    for (var i = 0; i < this.props.badgeCount; i++) {
      rows.push(
        <div className="guide-timeline-cell">
          <div className={'guide-timeline-circle guide-timeline-circle' + i}>
            <div className="guide-timeline-circle-item guide-timeline-circle-passive">
              {i + 1}
            </div>
            {this.renderActiveItem(i)}
          </div>
        </div>
      );
    }
    return rows;
  },
  render() {
    return (
      <div className="guide-timeline-row">
        {this.getItems()}

      </div>
    );
  }
});