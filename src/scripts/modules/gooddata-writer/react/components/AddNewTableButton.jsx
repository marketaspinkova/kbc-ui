import PropTypes from 'prop-types';
import React from 'react';
import {Map, fromJS} from 'immutable';
import _ from 'underscore';

import {Loader} from '@keboola/indigo-ui';
import SapiTableSelector from  '../../../components/react/components/SapiTableSelector';
import {Modal, Button} from 'react-bootstrap';

export default React.createClass({
  propTypes: {
    configuredTables: PropTypes.object.isRequired,
    localState: PropTypes.object.isRequired,
    isDisabled: PropTypes.bool.isRequired,
    addNewTableFn: PropTypes.func.isRequired,
    updateLocalStateFn: PropTypes.func.isRequired
  },

  render() {
    return (
      <span>
        {this.renderButton()}
        {this.renderModal()}
      </span>
    );
  },

  renderModal() {
    return (
      <Modal show={this.props.localState.get('show', false)} onHide={this.close}>
        <Modal.Header>
          <Modal.Title> New Table </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.renderBody()}
        </Modal.Body>
        <Modal.Footer>
          {this.props.localState.get('saving', false) ? <Loader/> : null}
          <Button bsStyle="link" onClick={this.close}>Cancel</Button>
          <Button bsStyle="success"
            disabled={this.props.localState.get('saving', false) || !this.isValid()}
            onClick={() => this.saveNewTable()}>
            Create Table
          </Button>
        </Modal.Footer>
      </Modal>
    );
  },

  renderButton() {
    return (
      <Button
        disabled={this.props.isDisabled}
        onClick={this.onAddNewTableButtonClick}
        bsStyle="success">
        <i className="kbc-icon-plus"/>New Table
      </Button>
    );
  },

  renderBody() {
    const data = this.props.localState;
    const sapiSelector = (
      <SapiTableSelector
        onSelectTableFn={(e) => {
          let tmpData = this.props.localState;
          tmpData = tmpData.set('title', e);
          tmpData = tmpData.set('value', e);
          this.props.updateLocalStateFn([], tmpData);
        }
        }
        value={this.props.localState.get('value')}
        allowedBuckets={['out', 'in']}
        excludeTableFn={this.isTableConfigured}
        placeholder="out.c-main.data"
        autoFocus
      />
    );
    return (
      <div className="form form-horizontal">
        {this.renderFormElement('Storage Table', sapiSelector)}
        {this.renderFormElement('Title',
          (<input
            className="form-control"
            value={data.get('title')}
            onChange={this.valueSetter('title')}/>))}
        {this.renderFormElement('Identifier',
          (<input
            placeholder="optional"
            className="form-control"
            value={data.get('identifier')}
            onChange={this.valueSetter('identifier')}/>))}
      </div>
    );
  },

  isTableConfigured(tableId) {
    return this.props.configuredTables.has(tableId);
  },

  renderFormElement(label, element, description = '', hasError = false) {
    let errorClass = 'form-group';
    if (hasError) {
      errorClass = 'form-group has-error';
    }

    return (
      <div className={errorClass}>
        <label className="control-label col-sm-3">
          {label}
        </label>
        <div className="col-sm-9">
          {element}
          <span className="help-block">{description}</span>
        </div>
      </div>
    );
  },

  isValid() {
    const data = this.props.localState;
    return !(_.isEmpty(data.get('title')) || _.isEmpty(data.get('value')));
  },

  valueSetter(key) {
    return (event) => {
      this.props.updateLocalStateFn([key], event.target.value);
    };
  },
  onAddNewTableButtonClick() {
    this.props.updateLocalStateFn(['show'], true);
  },

  saveNewTable() {
    const tableId = this.props.localState.get('value');
    const data = fromJS({
      title: this.props.localState.get('title'),
      identifier: this.props.localState.get('identifier')
    });
    this.props.updateLocalStateFn(['saving'], true);
    this.props.addNewTableFn(tableId, data).then( () =>
      this.close()
    );
  },

  close() {
    this.props.updateLocalStateFn([], Map());
  }

});
