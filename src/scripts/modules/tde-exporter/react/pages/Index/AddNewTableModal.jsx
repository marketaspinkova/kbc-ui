import React from 'react';
import { Modal } from 'react-bootstrap';
import SapiTableSelector from '../../../../components/react/components/SapiTableSelector';
import ConfirmButtons from '../../../../../react/common/ConfirmButtons';

export default React.createClass({
  propTypes: {
    show: React.PropTypes.bool.isRequired,
    onHideFn: React.PropTypes.func.isRequired,
    selectedTableId: React.PropTypes.string,
    onSetTableIdFn: React.PropTypes.func.isRequired,
    configuredTables: React.PropTypes.object,
    onSaveFn: React.PropTypes.func.isRequired
  },

  render() {
    return (
      <Modal show={this.props.show} onHide={() => this.props.onHideFn()}>
        <Modal.Header closeButton={true}>
          <Modal.Title>Add Table</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <SapiTableSelector
            autoFocus={true}
            placeholder="Source table"
            value={this.props.selectedTableId}
            onSelectTableFn={this.props.onSetTableIdFn}
            excludeTableFn={tableId => !!(this.props.configuredTables && this.props.configuredTables.get(tableId))}
          />
        </Modal.Body>
        <Modal.Footer>
          <ConfirmButtons
            isSaving={false}
            isDisabled={!!!this.props.selectedTableId}
            cancelLabel="Cancel"
            saveLabel="Select"
            onCancel={() => this.props.onHideFn()}
            onSave={() => {
              this.props.onSaveFn(this.props.selectedTableId);
              this.props.onHideFn();
            }}
          />
        </Modal.Footer>
      </Modal>
    );
  }
});
