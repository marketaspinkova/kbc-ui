import PropTypes from 'prop-types';
import React from 'react';
import CreateSandboxModal from '../modals/ConfigureSandbox';
import Tooltip from './../../../../react/common/Tooltip';

export default React.createClass({
  propTypes: {
    backend: PropTypes.string.isRequired,
    transformationType: PropTypes.string.isRequired,
    runParams: PropTypes.object.isRequired,
    mode: PropTypes.oneOf(['link', 'button'])
  },

  getDefaultProps() {
    return {
      mode: 'link'
    };
  },

  getInitialState() {
    return {
      isModalOpen: false
    };
  },

  openModal(e) {
    e.stopPropagation();
    e.preventDefault();
    this.setState({
      isModalOpen: true
    });
  },

  render() {
    if (this.props.mode === 'button') {
      return (
        <Tooltip placement="top" tooltip="Create sandbox">
          <button className="btn btn-link" onClick={this.openModal}>
            <i className="fa fa-fw fa-wrench"/>
            {this.renderModal()}
          </button>
        </Tooltip>
      );
    } else {
      return (
        <a onClick={this.openModal}>
          <i className="fa fa-fw fa-wrench"/> New Sandbox
          {this.betaWarning()}
          {this.renderModal()}
        </a>
      );
    }
  },

  betaWarning() {
    if (this.props.transformationType === 'r' || this.props.transformationType === 'python') {
      return (
        <span>
          {' '}
          <span className="label label-info">
            BETA
          </span>
        </span>
      );
    }
  },

  renderModal() {
    return (
      <CreateSandboxModal
        defaultMode="prepare"
        show={this.state.isModalOpen}
        onHide={() => this.setState({ isModalOpen: false })}
        backend={this.props.backend}
        transformationType={this.props.transformationType}
        runParams={this.props.runParams}
      />
    );
  }
});
