import React, { PropTypes } from 'react';
import { Modal, Button } from 'react-bootstrap';
import Immutable from 'immutable';
import SapiTableSelector from '../../../components/react/components/SapiTableSelector';

import { Input } from '../../../../react/common/KbcBootstrap';
import {ConfirmButtons} from '@keboola/indigo-ui';
import ConfigurationRowsActions from '../../ConfigurationRowsActionCreators';

import immutableMixin from 'react-immutable-render-mixin';

export default React.createClass({
  mixins: [immutableMixin],

  propTypes: {
    componentType: PropTypes.string.isRequired,
    componentId: PropTypes.string.isRequired,
    configId: PropTypes.string.isRequired,
    onRowCreated: PropTypes.func.isRequired,
    emptyConfig: PropTypes.func.isRequired,
    objectName: PropTypes.string.isRequired
  },

  label() {
    return 'Add ' + this.props.objectName;
  },

  createChangeDescription(name) {
    return this.props.objectName + ' ' + name + ' added';
  },

  getInitialState() {
    return {
      isSaving: false,
      showModal: false,
      form: Immutable.fromJS({
        name: '',
        description: ''
      })
    };
  },

  open() {
    this.setState({showModal: true});
  },

  close() {
    this.setState(this.getInitialState());
  },

  onRowCreated(rowId) {
    this.close();
    this.props.onRowCreated(rowId);
  },

  renderModal() {
    return (
      <Modal onHide={this.close} show={this.state.showModal}>
        <Modal.Header closeButton={true}>
          <Modal.Title>
            {this.label()}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {this.form()}
        </Modal.Body>

        <Modal.Footer>
          <ConfirmButtons
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

  render() {
    return (
      <Button onClick={this.handleOpenButtonClick} bsStyle="success">
        <i className="kbc-icon-plus" />{' '}{this.label()}
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
        <label className="col-sm-4 control-label">
          Table
        </label>
        <div className="col-sm-6">
          <SapiTableSelector
            placeholder="Select..."
            value={this.state.form.get('name')}
            onSelectTableFn= {this.setSelectedTable}
            excludeTableFn= { () => false}/>
        </div>
      </div>

    );
  },

  setSelectedTable(newTableId) {
    this.setState({
      form: this.state.form.set('name', newTableId)
    });
  },

  form() {
    return (
      <form className="form-horizontal" onSubmit={this.handleSubmit}>
        {this.props.componentType === 'writer' ?
          this.renderTableSelector()
          :
          <Input
            type="text"
            value={this.state.form.get('name')}
            autoFocus={true}
            onChange={this.handleChange.bind(this, 'name')}
            placeholder="Name"
            label="Name"
            ref="name"
            labelClassName="col-sm-4"
            wrapperClassName="col-sm-6"/>
        }
        <Input
          type="textarea"
          value={this.state.form.get('description')}
          onChange={this.handleChange.bind(this, 'description')}
          placeholder="Description"
          label="Description"
          labelClassName="col-sm-4"
          wrapperClassName="col-sm-6"/>
      </form>
    );
  },

  isValid() {
    return this.state.form.get('name').length > 0;
  },

  handleChange(field, e) {
    this.setState({
      form: this.state.form.set(field, e.target.value)
    });
  },

  handleSubmit(e) {
    e.preventDefault();
    if (this.isValid()) {
      this.handleCreate();
    }
  },


  handleCreate() {
    this.setState({isSaving: true});
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
      this.setState({isSaving: false});
    });
  }
});
