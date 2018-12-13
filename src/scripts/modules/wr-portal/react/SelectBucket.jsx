import React, {PropTypes} from 'react';
import {Modal, Button} from 'react-bootstrap';
import SapiTableSelector from '../../components/react/components/SapiTableSelector';
import ConfirmButtons from '../../../react/common/ConfirmButtons';
import {NotAvailable} from '@keboola/indigo-ui';

export default React.createClass({
  propTypes: {
    selectBucketFn: PropTypes.func,
    localState: PropTypes.object,
    setState: PropTypes.func,
    isSaving: PropTypes.bool
  },

  render() {
    return (
      <span>
        <Button
          bsStyle="success"
          onClick={() => this.props.setState('show', true)}
        >
          Select Bucket
        </Button>
        {this.renderModal()}
      </span>
    );
  },

  renderModal() {
    return (
      <Modal
        show={!!this.props.localState.get('show')}
        onHide={this.onHideModal}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Select Redshift Bucket
          </Modal.Title>
        </Modal.Header>
        {this.renderModalBody()}
        <Modal.Footer>
          <ConfirmButtons
            isSaving={this.props.isSaving}
            isDisabled={this.props.isSaving || !this.isValid()}
            onSave={this.onSaveBucket}
            onCancel={this.onHideModal}
            saveLabel="Generate credentials"
          />
        </Modal.Footer>
      </Modal>
    );
  },

  onSaveBucket() {
    const bucketId = this.props.localState.get('bucketId');
    this.props.selectBucketFn(bucketId);
  },

  isValid() {
    return this.props.localState.has('bucketId');
  },

  renderModalBody() {
    return (
      <Modal.Body>
        <div className="row">
          {this.renderFormElement(
            '',
            <SapiTableSelector
              placeholder="select a table and the bucket will get selected automatically"
              value={this.props.localState.get('table')}
              onSelectTableFn={this.selectTable}
              excludeTableFn= {this.filterRedshiftTables}
            />, '')
          }
          {this.renderFormElement('Selected Bucket', this.props.localState.get('bucketId') || <NotAvailable/>)}
        </div>
      </Modal.Body>
    );
  },

  filterRedshiftTables(tableId, table) {
    /*     console.log(tableId, table.toJS()); */
    return table.getIn(['bucket', 'backend']) !== 'redshift';
  },

  selectTable(tableId, table) {
    this.props.setState('bucketId', table.getIn(['bucket', 'id']));
  },

  renderFormElement(label, element, description = '', hasError = false) {
    let errorClass = 'form-group';
    if (hasError) {
      errorClass = 'form-group has-error';
    }
    if (label === '') {
      return (
        <div className={errorClass}>
          <div className="col-sm-12">
            {element}
            <span className="help-block">{description}</span>
          </div>

        </div>
      );
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

  onHideModal() {
    this.props.setState('show', false);
  }

});
