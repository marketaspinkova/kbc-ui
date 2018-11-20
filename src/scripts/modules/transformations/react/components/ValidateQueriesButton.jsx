import React from 'react';
import Modal from '../modals/ValidateQueriesModal';

export default React.createClass({
  propTypes: {
    transformationId: React.PropTypes.string.isRequired,
    bucketId: React.PropTypes.string.isRequired,
    backend: React.PropTypes.string.isRequired,
    modalOpen: React.PropTypes.bool.isRequired,
    onModalOpen: React.PropTypes.func.isRequired,
    onModalClose: React.PropTypes.func.isRequired,
    isSaved: React.PropTypes.bool.isRequired
  },

  handleOpenButtonClick(e) {
    e.preventDefault();
    return this.props.onModalOpen();
  },

  render() {
    return (
      <a onClick={this.handleOpenButtonClick}>
        <i className="fa fa-check-square-o fa-fw" />
        {' '}Validate
        <span>{' '}
          <span className="label label-info">BETA</span>
        </span>
        <Modal
          transformationId={this.props.transformationId}
          bucketId={this.props.bucketId}
          backend={this.props.backend}
          show={this.props.modalOpen}
          onHide={this.props.onModalClose}
          isSaved={this.props.isSaved}
        />

      </a>
    );
  }
});
