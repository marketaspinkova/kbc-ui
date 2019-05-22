import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import { Button, Label } from 'react-bootstrap';
import Modal from '../modals/ValidateQueriesModal';

export default createReactClass({
  propTypes: {
    backend: PropTypes.string.isRequired,
    bucketId: PropTypes.string.isRequired,
    transformation: PropTypes.object.isRequired,
    modalOpen: PropTypes.bool.isRequired,
    onModalOpen: PropTypes.func.isRequired,
    onModalClose: PropTypes.func.isRequired,
    isSaved: PropTypes.bool.isRequired
  },

  render() {
    return (
      <Button bsStyle="link" className="btn-block" onClick={this.props.onModalOpen}>
        <i className="fa fa-check-square-o fa-fw" /> Validate <Label bsStyle="info">BETA</Label>
        <Modal
          backend={this.props.backend}
          bucketId={this.props.bucketId}
          transformation={this.props.transformation}
          show={this.props.modalOpen}
          onHide={this.props.onModalClose}
          isSaved={this.props.isSaved}
        />
      </Button>
    );
  }
});
