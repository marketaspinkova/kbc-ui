import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Loader } from '@keboola/indigo-ui';
import Tooltip from '../../react/common/Tooltip';
import Modal from './ClearAdaptiveInputMappingModal';
import { Button } from 'react-bootstrap';

export default createReactClass({
  propTypes: {
    onClick: PropTypes.func.isRequired,
    isPending: PropTypes.bool.isRequired,
    disabled: PropTypes.bool.isRequired,
    tooltipPlacement: PropTypes.string
  },

  getDefaultProps() {
    return {
      tooltipPlacement: 'top'
    };
  },

  getInitialState() {
    return {
      showModal: false
    };
  },

  renderModal() {
    return (
      <Modal
        onHide={() => {
          this.setState({ showModal: false });
        }}
        show={this.state.showModal}
        onRequestRun={this.onClick}
        disabled={this.props.disabled}
      />
    );
  },

  render() {
    const body = (
      <span>
        {this.renderIcon()}
        Reset
      </span>
    );
    return (
      <Button bsStyle="link" className="btn-link-inline" onClick={this.onModalOpen}>
        {this.renderModal()}
        {this.tooltipWrapper(body)}
      </Button>
    );
  },

  onModalOpen() {
    if (!this.props.disabled) {
      this.setState({ showModal: true });
    }
  },

  tooltipWrapper(body) {
    if (this.props.disabled) {
      return (
        <Tooltip
          tooltip="Clears information about previous runs."
          placement={this.props.tooltipPlacement}
        >
          {body}
        </Tooltip>
      );
    }
    if (this.props.isPending) {
      return (
        <Tooltip tooltip="Clearing state" placement={this.props.tooltipPlacement}>
          {body}
        </Tooltip>
      );
    }
    return (
      <Tooltip
        tooltip="Clears information about previous runs."
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
        <span>
          <Loader className="fa-fw" />{' '}
        </span>
      );
    }
  }
});
