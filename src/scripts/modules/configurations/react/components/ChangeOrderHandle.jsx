import PropTypes from 'prop-types';
import React from 'react';

import createReactClass from 'create-react-class';

import Tooltip from '../../../../react/common/Tooltip';
import { Loader } from '@keboola/indigo-ui';

export default createReactClass({
  propTypes: {
    isPending: PropTypes.bool.isRequired,
    isPendingLabel: PropTypes.string,
    label: PropTypes.string,
    disabled: PropTypes.bool.isRequired,
    disabledLabel: PropTypes.string,
    tooltipPlacement: PropTypes.string
  },

  getDefaultProps() {
    return {
      tooltipPlacement: 'top',
      label: 'Drag to change order',
      disabledLabel: 'Clear search query to allow changing order',
      isPendingLabel: 'Ordering in progress'
    };
  },

  tooltipLabel() {
    if (this.props.disabled) {
      return this.props.disabledLabel;
    }
    if (this.props.isPending) {
      return this.props.isPendingLabel;
    }
    return this.props.label;
  },

  render() {
    return (
      <Tooltip placement={this.props.tooltipPlacement} tooltip={this.tooltipLabel()}>
        {this.renderIcon()}
      </Tooltip>
    );
  },

  renderIcon() {
    if (this.props.isPending) {
      return (<Loader className="fa-fw drag-handle-pending"/>);
    }
    if (this.props.disabled) {
      return (<span className="fa fa-ellipsis-v fa-fw drag-handle-disabled"/>);
    }
    return ((<span className="fa fa-ellipsis-v fa-fw drag-handle"/>));
  }
});

