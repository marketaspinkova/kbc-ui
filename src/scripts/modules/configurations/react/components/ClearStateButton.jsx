import React from 'react';
import {Loader} from '@keboola/indigo-ui';
import Tooltip from '../../../../react/common/Tooltip';
import Modal from './ClearStateButtonModal';

export default React.createClass({
  propTypes: {
    onClick: React.PropTypes.func.isRequired,
    isPending: React.PropTypes.bool.isRequired,
    disabled: React.PropTypes.bool.isRequired,
    children: React.PropTypes.node.isRequired,
    disabledTooltip: React.PropTypes.string,
    label: React.PropTypes.string,
    tooltipPlacement: React.PropTypes.string,
    tooltip: React.PropTypes.string
  },

  getDefaultProps() {
    return {
      label: 'Clear State',
      disabledTooltip: 'No stored state',
      tooltipPlacement: 'top',
      tooltip: 'State stores information from the previous run(s) and allows e.g. incremental loads.'
    };
  },

  getInitialState: function() {
    return {
      showModal: false
    };
  },

  renderModal() {
    const component = this;
    return (
      <Modal
        onHide={function() {
          component.setState({showModal: false});
        }}
        show={this.state.showModal}
        title={this.props.label}
        body={this.props.children}
        onRequestRun={this.onClick}
        disabled={this.props.disabled}
      />
    );
  },

  render() {
    const body = (
      <span>
        {this.renderIcon()}
        {' '}
        {this.props.label}
      </span>
    );
    return (
      <a onClick={this.onModalOpen}>
        {this.renderModal()}
        {this.tooltipWrapper(body)}
      </a>
    );
  },

  onModalOpen() {
    if (!this.props.disabled) {
      this.setState({showModal: true});
    }
  },

  tooltipWrapper(body) {
    if (this.props.disabled) {
      return (
        <Tooltip
          tooltip={this.props.disabledTooltip}
          placement={this.props.tooltipPlacement}
        >
          {body}
        </Tooltip>
      );
    }
    if (this.props.isPending) {
      return (
        <Tooltip
          tooltip="Clearing state"
          placement={this.props.tooltipPlacement}
        >
          {body}
        </Tooltip>
      );
    }
    return (
      <Tooltip
        tooltip={this.props.tooltip}
        placement={this.props.tooltipPlacement}
      >
        {body}
      </Tooltip>
    );
  },


  onClick(e) {
    if (!this.props.disabled) {
      e.stopPropagation();
      e.preventDefault();
      this.props.onClick();
    }
  },

  renderIcon() {
    if (this.props.isPending) {
      return (
        <Loader className="fa-fw"/>
      );
    } else {
      return (
        <i className="fa fa-fw fa-undo"/>
      );
    }
  }
});

