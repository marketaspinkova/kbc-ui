import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import SapiTableSelector from '../../modules/components/react/components/SapiTableSelector';

import ConfirmButtons from './ConfirmButtons';


export default React.createClass({

  propTypes: {
    show: PropTypes.bool,
    onHideFn: PropTypes.func,
    selectedTableId: PropTypes.string,
    onSetTableIdFn: PropTypes.func,
    configuredTables: PropTypes.object,
    onSaveFn: PropTypes.func,
    isSaving: PropTypes.bool,
    allowedBuckets: PropTypes.array
  },

  getDefaultProps() {
    return {
      allowedBuckets: ['in', 'out']
    };
  },

  render() {
    return (
      <Modal
        onHide={this.props.onHideFn}
        show={this.props.show}>
        <Modal.Header closeButton>
          <Modal.Title> New Table </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <SapiTableSelector
            allowedBuckets={this.props.allowedBuckets}
            onSelectTableFn={this.props.onSetTableIdFn}
            excludeTableFn={ (tableId) => !!this.props.configuredTables.get(tableId)}
            value={this.props.selectedTableId}
            placeholder="Select table"
            autoFocus
          />
        </Modal.Body>
        <Modal.Footer>
          <ConfirmButtons
            isSaving={this.props.isSaving}
            isDisabled={!this.props.selectedTableId}
            cancelLabel="Cancel"
            saveLabel="Create Table"
            onCancel={this.props.onHideFn}
            onSave={ () => {
              this.props.onSaveFn(this.props.selectedTableId).then(() => this.props.onHideFn());
            }}
          />
        </Modal.Footer>
      </Modal>

    );
  }
});
