import React, { PropTypes } from 'react';
import { Col, Modal, Form, FormGroup, FormControl, ControlLabel, HelpBlock } from 'react-bootstrap';
import Select from 'react-select';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';

export default React.createClass({
  propTypes: {
    table: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      name: ''
    };
  },

  render() {
    return (
      <Modal show={true} onHide={this.onHide} enforceFocus={false}>
        <Form onSubmit={this.onSubmit} horizontal>
          <Modal.Header closeButton>
            <Modal.Title>Create column</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormGroup>
              <Col sm={3} componentClass={ControlLabel}>
                Name
              </Col>
              {this.props.table.get('sourceTable') ? (
                <Col sm={9}>
                  <Select
                    clearable={false}
                    placeholder="Column name"
                    value={this.state.name}
                    onChange={this.handleSelectedName}
                    options={this.columnsOptions()}
                  />
                </Col>
              ) : (
                <Col sm={9}>
                  <FormControl
                    type="text"
                    value={this.state.name}
                    onChange={this.handleName}
                    placeholder="Column name"
                  />
                  <HelpBlock>
                    <p>Only alphanumeric characters, dash and underscore are allowed.</p>
                  </HelpBlock>
                </Col>
              )}
            </FormGroup>
          </Modal.Body>
          <Modal.Footer>
            <ConfirmButtons
              isSaving={false}
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

  handleSelectedName(column) {
    this.setState({
      name: column.value
    });
  },

  handleName(event) {
    this.setState({
      name: event.target.value
    });
  },

  columnsOptions() {
    const columns = this.props.table.get('columns');
    const sourceTableId = this.props.table.getIn(['sourceTable', 'id']);
    const sourceTable = this.props.tables.find(table => table.get('id') === sourceTableId);
    return sourceTable
      .get('columns')
      .filter(column => !columns.includes(column))
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

  onSubmit(event) {
    event.preventDefault();
    this.props.onSubmit(this.state.name);
    this.onHide();
  },

  resetState() {
    this.setState({
      name: ''
    });
  },

  isDisabled() {
    return !this.state.name;
  }
});
