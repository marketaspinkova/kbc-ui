import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';

export default React.createClass({
  propTypes: {
    valueCurrent: PropTypes.number.isRequired,
    valueMax: PropTypes.number.isRequired
  },

  render() {
    const isOverLimit = this.isOverLimit();
    return (
      <div className={classnames('kbc-limit-progress', { 'kbc-limit-ok': !isOverLimit })}>
        <div className={classnames('progress', { 'kbc-limit-exceed': isOverLimit })}>
          <div
            className="progress-bar"
            role="progressbar"
            aria-valuenow={this.currentValue()}
            aria-valuemin="0"
            aria-valuemax={this.maxValue()}
            style={this.barStyle()}
          >
            {!isOverLimit && <span className="progress-value">{this.props.valueCurrent}</span>}
          </div>
          {isOverLimit && <span className="progress-value">{this.props.valueCurrent}</span>}
        </div>
        <div className="kbc-limit-line" style={this.limitLineStyle()} />
      </div>
    );
  },

  barStyle() {
    return {
      width: `${(this.currentValue() / this.maxValue()) * 100}%`
    };
  },

  limitLineStyle() {
    if (this.isOverLimit()) {
      return {
        left: `${(this.props.valueMax / this.props.valueCurrent) * 100}%`
      };
    }

    return {
      right: 0
    };
  },

  isOverLimit() {
    return this.props.valueCurrent > this.props.valueMax;
  },

  currentValue() {
    return this.isOverLimit() ? this.props.valueMax : this.props.valueCurrent;
  },

  maxValue() {
    return this.isOverLimit() ? this.props.valueCurrent : this.props.valueMax;
  }
});
