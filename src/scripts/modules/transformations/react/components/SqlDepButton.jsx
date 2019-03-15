import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Modal from '../modals/SqlDepModal';

export default createReactClass({
  propTypes: {
    transformationId: PropTypes.string.isRequired,
    bucketId: PropTypes.string.isRequired,
    backend: PropTypes.string.isRequired
  },

  getInitialState() {
    return {
      showModal: false
    };
  },

  close() {
    return this.setState({
      showModal: false
    });
  },

  open() {
    this.setState({
      showModal: true
    });
  },

  betaWarning() {
    if (this.props.backend === 'snowflake') {
      return (
        <span>{' '}
          <span className="label label-info">BETA</span>
        </span>
      );
    }
  },

  render() {
    return (
      <a onClick={this.handleOpenButtonClick}>
        <i className="fa fa-sitemap fa-fw" />
        {' '}SQLdep
        {this.betaWarning()}
        <Modal
          transformationId={this.props.transformationId}
          bucketId={this.props.bucketId}
          backend={this.props.backend}
          show={this.state.showModal}
          onHide={this.close}
        />
      </a>
    );
  },

  handleOpenButtonClick(e) {
    e.preventDefault();
    return this.open();
  }
});
