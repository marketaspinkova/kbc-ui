import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import immutableMixin from 'react-immutable-render-mixin';
import { fromJS } from 'immutable';
import { Button, Col, ControlLabel, Form, FormControl, FormGroup, Modal } from 'react-bootstrap';
import SapiTableSelector from '../../../components/react/components/SapiTableSelector';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';
import ConfigurationRowsActions from '../../ConfigurationRowsActionCreators';

export default createReactClass({
  mixins: [immutableMixin],

  propTypes: {
    componentType: PropTypes.string.isRequired,
    componentId: PropTypes.string.isRequired,
    configId: PropTypes.string.isRequired,
    onRowCreated: PropTypes.func.isRequired,
    emptyConfig: PropTypes.func.isRequired,
    objectName: PropTypes.string.isRequired
  },

  getInitialState() {
    return {
      isSaving: false,
      showModal: false,
      form: fromJS({
        name: '',
        description: ''
      })
    };
  },

  render() {
    return (
      <Button onClick={this.handleOpenButtonClick} bsStyle="success">
        <i className="kbc-icon-plus" /> {this.label()}
        {this.renderModal()}
      </Button>
    );
  },

  renderModal() {
    return (
      <Modal onHide={this.close} show={this.state.showModal}>
        <Modal.Header closeButton>
          <Modal.Title>{this.label()}</Modal.Title>
        </Modal.Header>

        <Modal.Body>{this.form()}</Modal.Body>

        <Modal.Footer>
          <ConfirmButtons
            saveButtonType="submit"
            isSaving={this.state.isSaving}
            isDisabled={!this.isValid()}
            saveLabel="Create"
            onCancel={this.close}
            onSave={this.handleCreate}
          />
        </Modal.Footer>
      </Modal>
    );
  },

  form() {
    return (
      <Form horizontal onSubmit={this.handleSubmit}>
        {this.props.componentType === 'writer' ? (
          <FormGroup>
            <Col sm={3} componentClass={ControlLabel}>
              Table
            </Col>
            <Col sm={9}>
              <SapiTableSelector
                autoFocus
                placeholder="Select..."
                value={this.state.form.get('name')}
                onSelectTableFn={this.setSelectedTable}
              />
            </Col>
          </FormGroup>
        ) : (
          <FormGroup>
            <Col sm={3} componentClass={ControlLabel}>
              Name
            </Col>
            <Col sm={9}>
              <FormControl
                autoFocus
                type="text"
                value={this.state.form.get('name')}
                onChange={this.handleChange.bind(this, 'name')}
              />
            </Col>
          </FormGroup>
        )}
        <FormGroup>
          <Col sm={3} componentClass={ControlLabel}>
            Description
          </Col>
          <Col sm={9}>
            <FormControl
              componentClass="textarea"
              rows={3}
              value={this.state.form.get('description')}
              onChange={this.handleChange.bind(this, 'description')}
            />
          </Col>
        </FormGroup>
      </Form>
    );
  },

  label() {
    return 'Add ' + this.props.objectName;
  },

  createChangeDescription(name) {
    return this.props.objectName + ' ' + name + ' added';
  },

  open() {
    this.setState({ showModal: true });
  },

  close() {
    this.setState(this.getInitialState());
  },

  onRowCreated(rowId) {
    this.close();
    this.props.onRowCreated(rowId);
  },

  setSelectedTable(newTableId) {
    this.setState({
      form: this.state.form.set('name', newTableId)
    });
  },

  isValid() {
    return this.state.form.get('name').length > 0;
  },

  handleChange(field, e) {
    this.setState({
      form: this.state.form.set(field, e.target.value)
    });
  },

  handleOpenButtonClick(e) {
    e.preventDefault();
    this.open();
  },

  handleSubmit(e) {
    e.preventDefault();
    if (this.isValid()) {
      this.handleCreate();
    }
  },

  handleCreate() {
    this.setState({ isSaving: true });
    let friendlyName = this.state.form.get('name');
    if (this.props.componentType === 'writer') {
      friendlyName = friendlyName.substr(friendlyName.lastIndexOf('.') + 1);
    }
    ConfigurationRowsActions.create(
      this.props.componentId,
      this.props.configId,
      this.state.form.get('name'),
      friendlyName,
      this.state.form.get('description'),
      this.props.emptyConfig,
      this.onRowCreated,
      this.createChangeDescription(friendlyName)
    ).catch(() => {
      this.setState({ isSaving: false });
    });
  }
});
