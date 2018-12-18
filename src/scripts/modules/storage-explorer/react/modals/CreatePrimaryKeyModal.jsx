import React, { PropTypes } from 'react';
import { Col, HelpBlock, Modal, Form, FormGroup, ControlLabel } from 'react-bootstrap';
import Select from 'react-select';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';

export default React.createClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
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
      <Modal show={this.props.show} onHide={this.onHide} enforceFocus={false}>
        <Form onSubmit={this.handleSubmit} horizontal>
          <Modal.Header closeButton>
            <Modal.Title>Create primary key</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.renderMysqlWarning()}

            <FormGroup>
              <Col sm={3} componentClass={ControlLabel}>
                Columns
              </Col>
              <Col sm={9}>
                <Select
                  clearable={false}
                  multi={true}
                  placeholder="Check one or more columns"
                  value={this.state.primaryKey}
                  onChange={this.handlePrimaryKey}
                  options={this.columnsOptions()}
                />
              </Col>
            </FormGroup>
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

    return <HelpBlock>Columns will be truncated to 255 characters</HelpBlock>;
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
