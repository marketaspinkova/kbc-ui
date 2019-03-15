import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import classnames from 'classnames';
import { Button } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';
import Confirm from './Confirm';
import Tooltip from './Tooltip';

export default createReactClass({
  propTypes: {
    confirm: PropTypes.shape({
      title: PropTypes.string.isRequired,
      onConfirm: PropTypes.func.isRequired,
      text: PropTypes.any,
      buttonLabel: PropTypes.string
    }).isRequired,
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
      <Confirm buttonLabel="Delete" {...this.props.confirm}>
        <Tooltip tooltip={this.props.tooltip} placement="top">
          <Button bsStyle="link">
            {this.renderIcon()}
            {this.renderLabel()}
          </Button>
        </Tooltip>
      </Confirm>
    );
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
