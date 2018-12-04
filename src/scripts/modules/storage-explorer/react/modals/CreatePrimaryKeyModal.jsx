import React, { PropTypes } from 'react';
import { HelpBlock, Alert, Modal, Form, ControlLabel } from 'react-bootstrap';
import Select from 'react-select';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';

const INITIAL_STATE = {
  primaryKey: [],
  error: null
};

export default React.createClass({
  propTypes: {
    columns: PropTypes.object.isRequired,
    backend: PropTypes.string.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
    isSaving: PropTypes.bool.isRequired
  },

  getInitialState() {
    return INITIAL_STATE;
  },

  render() {
    return (
      <Modal show={true} onHide={this.onHide} enforceFocus={false}>
        <Form horizontal>
          <Modal.Header closeButton>
            <Modal.Title>Create primary key</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.renderError()}
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
              isSaving={this.props.isSaving}
              isDisabled={this.isDisabled()}
              saveLabel="Create"
              onCancel={this.onHide}
              onSave={this.onSubmit}
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

  renderError() {
    if (!this.state.error) {
      return null;
    }
    return <div className="alert alert-danger">{this.state.error}</div>;
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

  onSubmit() {
    const primaryKeys = this.state.primaryKey.map(column => column.value);

    this.props.onSubmit(primaryKeys).then(
      () => {
        this.onHide();
      },
      message => {
        this.setState({
          error: message
        });
      }
    );
  },

  resetState() {
    this.setState(INITIAL_STATE);
  },

  isDisabled() {
    return this.props.isSaving || !this.state.primaryKey.length;
  }
});
