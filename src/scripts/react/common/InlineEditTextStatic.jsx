import React from 'react';
import Tooltip from './Tooltip';

export default React.createClass({
  propTypes: {
    text: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    editTooltip: React.PropTypes.string,
    onCancel: React.PropTypes.func,
    tooltipPlacement: React.PropTypes.string
  },

  render() {
    const { text, ...props } = this.props;

    return (
      <Tooltip tooltip={this.props.editTooltip} placement={this.props.tooltipPlacement}>
        <span className="kbc-inline-edit-link" {...props}>
          {text ? <span>{text}</span> : <span className="text-muted">{this.props.placeholder}</span>}{' '}
          <span className="kbc-icon-pencil" />
        </span>
      </Tooltip>
    );
  }
});
