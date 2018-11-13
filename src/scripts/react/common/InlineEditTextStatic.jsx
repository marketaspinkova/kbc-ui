import React from 'react';
import Tooltip from './Tooltip';

export default React.createClass({
  propTypes: {
    text: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    editTooltip: React.PropTypes.string,
    tooltipPlacement: React.PropTypes.string,
    onClick: React.PropTypes.func
  },

  render() {
    return (
      <Tooltip tooltip={this.props.editTooltip} placement={this.props.tooltipPlacement}>
        <span className="kbc-inline-edit-link" onClick={this.props.onClick}>
          {this.props.text ? (
            <span>{this.props.text}</span>
          ) : (
            <span className="text-muted">{this.props.placeholder}</span>
          )}
          {' '}
          <span className="kbc-icon-pencil" />
        </span>
      </Tooltip>
    );
  }
});
