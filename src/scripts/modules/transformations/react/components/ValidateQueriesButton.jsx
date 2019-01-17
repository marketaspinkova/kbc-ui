import React, { PropTypes } from 'react';
import { Label } from 'react-bootstrap';
import Modal from '../modals/ValidateQueriesModal';

export default React.createClass({
  propTypes: {
    transformationId: PropTypes.string.isRequired,
    bucketId: PropTypes.string.isRequired,
    backend: PropTypes.string.isRequired,
    modalOpen: PropTypes.bool.isRequired,
    onModalOpen: PropTypes.func.isRequired,
    onModalClose: PropTypes.func.isRequired,
    isSaved: PropTypes.bool.isRequired
  },

  handleOpenButtonClick(e) {
    e.preventDefault();
    this.props.onModalOpen();
  },

  render() {
    return (
      <a onClick={this.handleOpenButtonClick}>
        <i className="fa fa-check-square-o fa-fw" /> Validate <Label bsStyle="info">BETA</Label>
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
