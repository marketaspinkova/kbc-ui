import PropTypes from 'prop-types';
import React from 'react';
import { List } from 'immutable';
import { Alert, Col, Modal, Form, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import Select from 'react-select';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';

export default React.createClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
    isSaving: PropTypes.bool.isRequired,
    table: PropTypes.object.isRequired
  },

  getInitialState() {
    return this.defaultValues();
  },

  render() {
    return (
      <Modal show={this.props.show} onHide={this.onHide}>
        <Form onSubmit={this.onSubmit} horizontal>
          <Modal.Header closeButton>
            <Modal.Title>Update filter</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert bsStyle="info">
              You can specify one column to be filtered and comma separated values you&apos;re looking for. The alias table
              will contain only these rows.
            </Alert>
            <FormGroup>
              <Col sm={3} componentClass={ControlLabel}>
                Column
              </Col>
              <Col sm={9}>
                <Select
                  clearable={false}
                  backspaceRemoves={false}
                  deleteRemoves={false}
                  value={this.state.column}
                  onChange={this.handleColumn}
                  options={this.tableColumns()}
                />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col sm={3} componentClass={ControlLabel}>
                Operator
              </Col>
              <Col sm={9}>
                <FormControl componentClass="select" value={this.state.operator} onChange={this.handleOperator}>
                  <option value="eq">= (IN)</option>
                  <option value="ne">!= (NOT IN)</option>
                </FormControl>
              </Col>
            </FormGroup>
            <FormGroup>
              <Col sm={3} componentClass={ControlLabel}>
                Values
              </Col>
              <Col sm={9}>
                <FormControl type="text" value={this.state.values} onChange={this.handleValues} />
              </Col>
            </FormGroup>
          </Modal.Body>
          <Modal.Footer>
            <ConfirmButtons
              isSaving={this.props.isSaving}
              isDisabled={this.isDisabled()}
              saveLabel="Update"
              onCancel={this.onHide}
              onSave={this.onSubmit}
              saveButtonType="submit"
            />
          </Modal.Footer>
        </Form>
      </Modal>
    );
  },

  defaultValues() {
    return {
      operator: this.props.table.getIn(['aliasFilter', 'operator'], 'eq'),
      column: this.props.table.getIn(['aliasFilter', 'column'], ''),
      values: this.props.table.getIn(['aliasFilter', 'values'], List()).join(', ')
    };
  },

  handleColumn(option) {
    this.setState({
      column: option.value
    });
  },

  handleOperator(event) {
    this.setState({
      operator: event.target.value
    });
  },

  handleValues(event) {
    this.setState({
      values: event.target.value
    });
  },

  onSubmit(event) {
    event.preventDefault();
    const params = {
      operator: this.state.operator,
      column: this.state.column,
      values: this.state.values.split(',').map(value => value.trim())
    };
    this.props.onSubmit(params).then(this.props.onHide);
  },

  onHide() {
    this.setState(this.defaultValues());
    this.props.onHide();
  },

  tableColumns() {
    return this.props.table
      .get('columns', List())
      .map(column => ({
        label: column,
        value: column
      }))
      .toArray();
  },

  isDisabled() {
    return !this.state.operator || !this.state.column || !this.state.values;
  }
});
