import PropTypes from 'prop-types';
import React from 'react';
import { Modal } from 'react-bootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';
import NewDimensionForm from './NewDimensionForm';
// import Confirm from '../../../../react/common/Confirm';
import {Check} from '@keboola/indigo-ui';
import Confirm from '../../../../react/common/Confirm';
import Tooltip from '../../../../react/common/Tooltip';


export default React.createClass({
  propTypes: {
    value: PropTypes.shape({
      dimensions: PropTypes.object.isRequired
    }),
    onChange: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      newDimension: {template: 'gooddata'},
      showModal: false
    };
  },

  openModal(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({showModal: true});
  },

  closeModal() {
    if (!this.props.disabled) {
      this.setState({showModal: false, newDimension: {template: 'gooddata'}});
    }
  },

  renderModal() {
    return (
      <Modal onHide={this.closeModal} show={this.state.showModal}>
        <Modal.Header closeButton={true}>
          <Modal.Title>
            New Date Dimension
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <NewDimensionForm
            value={this.state.newDimension}
            onChange={val => this.setState({newDimension: val})}
            disabled={this.props.disabled}
          />
        </Modal.Body>

        <Modal.Footer>
          <ConfirmButtons
            isSaving={this.props.disabled}
            isDisabled={!this.isValid()}
            saveLabel="Create Date Dimension"
            onCancel={this.closeModal}
            onSave={this.handleCreate}/>
        </Modal.Footer>
      </Modal>
    );
  },

  isValid() {
    const {name, template, templateId} = this.state.newDimension;
    return name && (template === 'custom' ? templateId : true);
  },

  render() {
    const dimensionKeys = Object.keys(this.props.value.dimensions);
    const dimensions = this.props.value.dimensions;
    const hasDimensions = Object.keys(dimensions).length > 0;
    return (
      <div className="table-config-rows">
        {this.renderModal()}
        {hasDimensions ?
          <span>
            <div className="btn-toolbar kbc-inner-padding">
              <div className="pull-right">
                {this.renderAddButton()}
              </div>
            </div>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Include Time</th>
                  <th>Identifier</th>
                  <th>Template</th>
                  <th/>
                </tr>
              </thead>
              <tbody>
                {
                  dimensionKeys.map(dimName => {
                    const dim = dimensions[dimName];
                    return (
                      <tr key={dimName}>
                        <td> {dimName}</td>
                        <td> <Check isChecked={!!dim.includeTime}/></td>
                        <td> {dim.identifier}</td>
                        <td> {dim.template}</td>
                        <td> {this.renderDeleteButton(dimName)}</td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </span>
          : this.renderEmptyDimensions()
        }
      </div>
    );
  },

  renderEmptyDimensions() {
    return (
      <div className="kbc-inner-padding">
        <div className="component-empty-state text-center">
          <p>No dimensions created yet</p>
          {this.renderAddButton()}
        </div>
      </div>
    );
  },

  renderDeleteButton(dimensionName) {
    return (
      <Confirm
        text={`Do you really want to delete dimensions ${dimensionName}?`}
        title={`Delete dimension ${dimensionName}`}
        buttonLabel="Delete"
        onConfirm={() => this.handleDelete(dimensionName)}>
        <div className="kbc-no-wrap pull-right">
          <Tooltip tooltip="Delete" placement="top">
            <button className="btn btn-link"
              disabled={this.props.disabled}>
              <i className="kbc-icon-cup fa fa-fw"/>
            </button>
          </Tooltip>
        </div>
      </Confirm>
    );
  },

  handleDelete(dimensionName) {
    const dimensionsToSave = {...this.props.value.dimensions};
    delete dimensionsToSave[dimensionName];
    this.props.onSave({dimensions: dimensionsToSave});
  },

  renderAddButton() {
    return (
      <div>
        <button
          disabled={this.props.disabled}
          onClick={this.openModal}
          className="btn btn-success">
          + New Date Dimension
        </button>
      </div>
    );
  },

  handleCreate(e) {
    e.preventDefault();
    e.stopPropagation();
    const newDimension = {...this.state.newDimension, includeTime: !!this.state.newDimension.includeTime};
    const name = this.state.newDimension.name;
    delete newDimension.name;
    if (newDimension.template === 'custom') {
      newDimension.template = newDimension.templateId;

    }
    delete newDimension.templateId;
    const dimensionsToSave = {...this.props.value.dimensions, [name]: newDimension};
    this.props.onSave({dimensions: dimensionsToSave}).then(this.closeModal);
  }
});
