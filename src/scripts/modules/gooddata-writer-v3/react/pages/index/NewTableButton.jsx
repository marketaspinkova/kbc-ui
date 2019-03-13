import PropTypes from 'prop-types';
import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import SapiTableSelector from '../../../../components/react/components/SapiTableSelector';

import ConfirmButtons from '../../../../../react/common/ConfirmButtons';

export default React.createClass({

  propTypes: {
    onCreateTable: PropTypes.func.isRequired,
    createdTables: PropTypes.object
  },

  getInitialState() {
    return {
      isSaving: false,
      showModal: false,
      tableId: ''
    };
  },

  open() {
    this.setState({showModal: true});
  },

  close() {
    this.setState(this.getInitialState());
  },

  renderModal() {
    return (
      <Modal onHide={this.close} show={this.state.showModal}>
        <Modal.Header closeButton={true}>
          <Modal.Title>
            New Table
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {this.form()}
        </Modal.Body>

        <Modal.Footer>
          <ConfirmButtons
            isSaving={this.state.isSaving}
            isDisabled={!this.state.tableId || !this.state.title}
            saveLabel="Create Table"
            onCancel={this.close}
            onSave={this.handleCreate}
          />
        </Modal.Footer>
      </Modal>
    );
  },

  render() {
    return (
      <Button onClick={this.handleOpenButtonClick} bsStyle="success">
        <i className="kbc-icon-plus" />{' New Table'}
        {this.renderModal()}
      </Button>
    );
  },

  handleOpenButtonClick(e) {
    e.preventDefault();
    this.open();
  },

  renderTableSelector() {
    return (
      <div className="form-group">
        <label className="col-sm-3 control-label">
          Table
        </label>
        <div className="col-sm-9">
          <SapiTableSelector
            placeholder="Select..."
            value={this.state.tableId}
            onSelectTableFn={this.setSelectedTable}
            excludeTableFn={(tableId) => this.props.createdTables.has(tableId)}/>
        </div>
      </div>

    );
  },

  setSelectedTable(newTableId) {
    this.setState({
      tableId: newTableId,
      title: newTableId
    });
  },

  form() {
    return (
      <form className="form-horizontal" onSubmit={this.handleSubmit}>
        {this.renderTableSelector()}
        <div className="form-group">
          <label className="col-sm-3 control-label">
            Title
          </label>
          <div className="col-sm-9">
            <input className="form-control"
              onChange={e => this.setState({title: e.target.value})}
              value={this.state.title} />
          </div>
        </div>
      </form>
    );
  },

  handleSubmit(e) {
    e.preventDefault();
    this.handleCreate();
  },

  cancelSaving() {
    this.setState({isSaving: false});
  },

  handleCreate() {
    this.setState({isSaving: true});
    this.props.onCreateTable(
      this.state.tableId,
      this.state.title
    ).finally(this.cancelSaving);
  }
});
