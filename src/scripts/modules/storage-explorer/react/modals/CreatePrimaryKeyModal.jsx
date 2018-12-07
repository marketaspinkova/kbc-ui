import React, { PropTypes } from 'react';
import { HelpBlock, Alert, Modal, Form, ControlLabel } from 'react-bootstrap';
import Select from 'react-select';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';

export default React.createClass({
  propTypes: {
    columns: PropTypes.object.isRequired,
    backend: PropTypes.string.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      primaryKey: []
    };
  },

  render() {
    return (
      <Modal show={true} onHide={this.onHide} enforceFocus={false}>
        <Form onSubmit={this.handleSubmit} horizontal>
          <Modal.Header closeButton>
            <Modal.Title>Create primary key</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.renderMysqlWarning()}

            <ControlLabel>Please check one or more columns</ControlLabel>
            <Select
              clearable={false}
              multi={true}
              placeholder="Columns"
              value={this.state.primaryKey}
              onChange={this.handlePrimaryKey}
              options={this.columnsOptions()}
            />
          </Modal.Body>
          <Modal.Footer>
            <ConfirmButtons
              isSaving={false}
              isDisabled={this.isDisabled()}
              saveLabel="Create"
              onCancel={this.onHide}
              onSave={this.handleSubmit}
              saveButtonType="submit"
            />
          </Modal.Footer>
        </Form>
      </Modal>
    );
  },

  renderMysqlWarning() {
    if (this.props.backend !== 'mysql') {
      return null;
    }

    return (
      <HelpBlock>
        <Alert>Columns will be truncated to 255 characters</Alert>
      </HelpBlock>
    );
  },

  handlePrimaryKey(selected) {
    this.setState({
      primaryKey: selected
    });
  },

  columnsOptions() {
    return this.props.columns
      .map(column => ({
        label: column,
        value: column
      }))
      .toArray();
  },

  onHide() {
    this.props.onHide();
    this.resetState();
  },

  handleSubmit() {
    const primaryKeys = this.state.primaryKey.map(column => column.value);

    this.props.onSubmit(primaryKeys);
    this.onHide();
  },

  resetState() {
    this.setState({
      primaryKey: []
    });
  },

  isDisabled() {
    return !this.state.primaryKey.length;
  }
});
