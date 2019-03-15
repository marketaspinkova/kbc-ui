import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Modal, Button } from 'react-bootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';
import TransformationActionCreators from '../../ActionCreators';

export default createReactClass({
  propTypes: {
    label: PropTypes.string.isRequired
  },

  getInitialState() {
    return {
      isLoading: false,
      name: '',
      description: '',
      showModal: false
    };
  },

  componentWillUnmount() {
    this.cancellablePromise && this.cancellablePromise.cancel();
  },

  render() {
    return (
      <span>
        {this._renderOpenButton()}
        <Modal show={this.state.showModal} onHide={this._close}>
          <Modal.Header closeButton={true}>
            <Modal.Title>New Transformation Bucket</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form className="form-horizontal" onSubmit={this._handleSubmit}>
              <p className="help-block">
                A transformation bucket is a container for related transformations.
                {' '}
                Once the bucket is created, you can create transformations inside it.
              </p>
              <div className="form-group">
                <label className="col-sm-4 control-label">Name</label>
                <div className="col-sm-6">
                  <input
                    placeholder="Main"
                    className="form-control"
                    value={this.state.text}
                    onChange={this._setName}
                    ref="name"
                    autoFocus={true}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="col-sm-4 control-label">Description</label>
                <div className="col-sm-6">
                  <textarea
                    placeholder="Main transformations"
                    className="form-control"
                    value={this.state.description}
                    onChange={this._setDescription}
                    ref="description"
                  />
                </div>
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <ConfirmButtons
              isSaving={this.state.isLoading}
              isDisabled={!this._isValid()}
              saveLabel="Create Bucket"
              onCancel={this._close}
              onSave={this._handleCreate}
            />
          </Modal.Footer>
        </Modal>
      </span>
    );
  },

  _renderOpenButton() {
    return (
      <Button onClick={this._open} bsStyle="success">
        <i className="kbc-icon-plus" />
        {this.props.label}
      </Button>
    );
  },

  _close() {
    this.setState({
      showModal: false
    });
  },

  _open() {
    this.setState({
      showModal: true
    });
  },

  _handleSubmit(e) {
    e.preventDefault();
    if (this._isValid()) {
      return this._handleCreate();
    }
  },

  _handleCreate() {
    this.setState({
      isLoading: true
    });

    this.cancellablePromise = TransformationActionCreators.createTransformationBucket({
      name: this.state.name,
      description: this.state.description
    }).then(this._close);
  },

  _setName(e) {
    return this.setState({
      name: e.target.value.trim()
    });
  },

  _setDescription(e) {
    return this.setState({
      description: e.target.value
    });
  },

  _isValid() {
    return this.state.name.length > 0;
  }
});
