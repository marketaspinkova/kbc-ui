import React, { PropTypes } from 'react';
import classnames from 'classnames';
import { Button } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';
import Tooltip from './Tooltip';

export default React.createClass({
  propTypes: {
    onDeleteFn: PropTypes.func.isRequired,
    isPending: PropTypes.bool,
    tooltip: PropTypes.string,
    isEnabled: PropTypes.bool,
    label: PropTypes.string,
    pendingLabel: PropTypes.string,
    fixedWidth: PropTypes.bool,
    icon: PropTypes.string
  },

  getDefaultProps() {
    return {
      tooltip: 'Delete',
      isPending: false,
      isEnabled: true,
      label: '',
      pendingLabel: '',
      fixedWidth: false,
      icon: 'kbc-icon-cup'
    };
  },

  render() {
    if (this.props.isPending) {
      return (
        <Button bsStyle="link" disabled>
          {this.renderLoader()}
        </Button>
      );
    }

    if (!this.props.isEnabled) {
      return (
        <Button bsStyle="link" disabled>
          {this.renderIcon()}
          {this.renderLabel()}
        </Button>
      );
    }

    return (
      <Tooltip tooltip={this.props.tooltip} placement="top">
        <Button bsStyle="link" onClick={this.handleDelete}>
          {this.renderIcon()}
          {this.renderLabel()}
        </Button>
      </Tooltip>
    );
  },

  handleDelete(e) {
    e.preventDefault();
    e.stopPropagation();
    this.props.onDeleteFn();
  },

  renderIcon() {
    return <i className={classnames('fa', this.props.icon, { 'fa-fw': this.props.fixedWidth })} />;
  },

  renderLabel() {
    return this.props.label || null;
  },

  renderLoader() {
    return (
      <span>
        <Loader className={classnames({ 'fa-fw': this.props.fixedWidth })} />
        {this.props.pendingLabel && ` ${this.props.pendingLabel}`}
      </span>
    );
  }
});
