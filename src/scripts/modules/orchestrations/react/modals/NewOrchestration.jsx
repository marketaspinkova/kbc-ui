import React from 'react';

import createReactClass from 'create-react-class';

import { Modal, Button } from 'react-bootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';
import OrchestrationActionCreators from '../../ActionCreators';

export default createReactClass({
  getInitialState() {
    return {
      isLoading: false,
      isValid: false,
      name: '',
      showModal: false
    };
  },

  close() {
    return this.setState({
      showModal: false
    });
  },

  open() {
    return this.setState({
      showModal: true
    });
  },

  render() {
    return (
      <div>
        {this.renderOpenButton()}
        <Modal show={this.state.showModal} onHide={this.close}>
          <Modal.Header closeButton={true}>
            <Modal.Title>New Orchestration</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form className="form-horizontal" onSubmit={this._handleSubmit}>
              <div className="form-group">
                <label className="col-sm-4 control-label">Name</label>
                <div className="col-sm-6">
                  <input
                    placeholder="Orchestration name"
                    className="form-control"
                    value={this.state.text}
                    onChange={this._setName}
                    ref="name"
                    autoFocus={true}
                  />
                </div>
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <ConfirmButtons
              isSaving={this.state.isLoading}
              isDisabled={!this.state.isValid}
              saveLabel="Create Orchestration"
              onCancel={this.close}
              onSave={this._handleCreate}
            />
          </Modal.Footer>
        </Modal>
      </div>
    );
  },

  renderOpenButton() {
    return (
      <Button onClick={this.open} bsStyle="success">
        <i className="kbc-icon-plus" />
        New Orchestration
      </Button>
    );
  },

  _handleSubmit(e) {
    e.preventDefault();
    if (this.state.isValid) {
      return this._handleCreate();
    }
  },

  _handleCreate() {
    this.setState({
      isLoading: true
    });

    return OrchestrationActionCreators.createOrchestration({
      name: this.state.name
    }).then(this.close);
  },

  _setName(e) {
    const name = e.target.value.trim();
    return this.setState({
      name,
      isValid: name.length > 0
    });
  }
});
