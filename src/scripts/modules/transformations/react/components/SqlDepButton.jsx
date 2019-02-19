import React from 'react';
import Modal from '../modals/SqlDepModal';

export default React.createClass({
  propTypes: {
    transformationId: React.PropTypes.string.isRequired,
    bucketId: React.PropTypes.string.isRequired,
    backend: React.PropTypes.string.isRequired
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
