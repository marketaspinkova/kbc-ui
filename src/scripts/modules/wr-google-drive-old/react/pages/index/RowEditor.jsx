import React from 'react';
import _ from 'underscore';
import { Modal } from 'react-bootstrap';
import { Loader, ConfirmButtons } from '@keboola/indigo-ui';

import { Input } from './../../../../../react/common/KbcBootstrap';
import Picker from '../../../../google-utils/react/GooglePicker';
import ViewTemplates from '../../../../google-utils/react/PickerViewTemplates';
import SapiTableSelector from '../../../../components/react/components/SapiTableSelector';
import SapiTableLinkEx from '../../../../components/react/components/StorageApiTableLinkEx';
import storageTablesStore from '../../../../components/stores/StorageTablesStore';

const tooltips = {
  file: 'uploads the selected table as a csv file',
  sheet: 'uploads the selected table as a google drive spreadsheet',
  update: 'always update the same file or sheet; if it does not exist, create one',
  create:
    'always create new files with a unique name by appending the current date and time to the name.'
};

export default React.createClass({
  propTypes: {
    editFn: React.PropTypes.func.isRequired,
    table: React.PropTypes.object,
    editData: React.PropTypes.object.isRequired,
    isSavingFn: React.PropTypes.func.isRequired,
    email: React.PropTypes.string.isRequired,
    googleInfo: React.PropTypes.object,
    saveFn: React.PropTypes.func.isRequired,
    updateGoogleFolderFn: React.PropTypes.func.isRequired,
    renderToModal: React.PropTypes.bool.isRequired,
    configuredTableIds: React.PropTypes.array.isRequired
  },

  getStateFromStores() {
    const isTablesLoading = storageTablesStore.getIsLoading();
    const tables = storageTablesStore.getAll();

    return {
      isTablesLoading,
      tables
    };
  },

  getDefaultProps() {
    return {
      configuredTableIds: []
    };
  },

  render() {
    if (this.props.renderToModal) {
      return this._renderToModal();
    }

    return (
      <div className="tr">
        <span className="td">
          <SapiTableLinkEx tableId={this.props.table.get('id')}>
            {this.props.table.get('name')}
          </SapiTableLinkEx>
        </span>
        <span className="td">
          <i className="kbc-icon-arrow-right" />
        </span>
        <span className="td">{this._renderTitleInput()}</span>
        <span className="td">{this._renderSelect(['update', 'create'], 'operation')}</span>
        <span className="td">{this._renderSelect(['sheet', 'file'], 'type')}</span>
        <span className="td">{this._renderPicker()}</span>
        <span className="td text-right kbc-no-wrap">
          {this._isSaving() && <Loader />}
          {this._renderCancelButton()}
          {this._renderSaveButton()}
        </span>
      </div>
    );
  },

  _renderToModal() {
    const operationSelect = this._renderSelect(['update', 'create'], 'operation');
    const typeSelect = this._renderSelect(['sheet', 'file'], 'type');
    return (
      <Modal
        onHide={() => {
          return this._cancel();
        }}
        show={true}
      >
        <Modal.Header closeButton={true}>
          <Modal.Title>Add New Table</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-horizontal clearfix">
            <div className="row col-md-12">
              {this._renderFormControl('Storage Table', this._renderTableSelector())}
              {this._renderFormControl('Title Table', this._renderTitleInput())}
              {this._renderFormControl('Operation', operationSelect)}
              {this._renderFormControl('Type', typeSelect)}
              {this._renderFormControl('Folder', this._renderPicker())}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <ConfirmButtons
            isSaving={this._isSaving()}
            isDisabled={this._isSaving() || !this._isValid()}
            saveLabel="Save"
            onCancel={this._cancel}
            onSave={this._startSaving}
          />
        </Modal.Footer>
      </Modal>
    );
  },

  _isValid() {
    return !!(this.props.editData.get('tableId') && this.props.editData.get('title'));
  },

  _isSaving() {
    return this.props.isSavingFn(this.props.editData.get('tableId'));
  },

  _renderFormControl(controlLabel, control) {
    return (
      <div className="form-group">
        <label className="col-xs-3 control-label">{controlLabel}</label>
        <div className="col-xs-9">{control}</div>
      </div>
    );
  },

  _cancel() {
    return this.props.editFn(null);
  },

  _renderSaveButton() {
    const isValid = this.props.editData.get('tableId') && this.props.editData.get('title');
    let className = 'btn btn-success btn-sm';
    if (this.props.renderToModal) {
      className = 'btn btn-success';
    }
    return (
      <button
        className={className}
        onClick={this._startSaving}
        disabled={!isValid || this._isSaving()}
      >
        Save
      </button>
    );
  },

  _renderCancelButton() {
    let className = 'btn btn-link btn-sm';
    if (this.props.renderToModal) {
      className = 'btn btn-link';
    }
    return (
      <button className={className} onClick={this._cancel} disabled={this._isSaving()}>
        Cancel
      </button>
    );
  },

  _renderTableSelector() {
    return (
      <SapiTableSelector
        placeholder="source table"
        value={this.props.editData.get('tableId')}
        onSelectTableFn={(newValue) => {
          const newData = this.props.editData.set('tableId', newValue);
          return this.props.editFn(newData);
        }}
        excludeTableFn={(tableId) => {
          return this.props.configuredTableIds.includes(tableId);
        }}
      />
    );
  },

  _renderTitleInput() {
    let bsize = 'small';
    if (this.props.renderToModal) {
      bsize = 'medium';
    }
    return (
      <Input
        value={this.props.editData && this.props.editData.get('title')}
        bsSize={bsize}
        type="text"
        onChange={(event) => {
          const data = event.target.value;
          const editData = this.props.editData.set('title', data);
          return this.props.editFn(editData);
        }} />
    );
  },

  _startSaving() {
    return this.props.saveFn(this.props.editData).then(() => {
      return this.props.editFn(null);
    });
  },

  _renderPicker() {
    let folderId, folderName;
    const file = this.props.editData;
    let bsize = 'small';
    if (this.props.renderToModal) {
      bsize = 'medium';
    }
    if (file) {
      folderId = file.get('targetFolder');
    }
    if (folderId) {
      folderName = this.props.googleInfo && this.props.googleInfo.get(folderId).get('title');
    }
    return (
      <Picker
        email={this.props.email}
        dialogTitle="Select a folder"
        buttonLabel={folderName || '/'}
        onPickedFn={(inputData) => {
          let data = _.filter(inputData, (fileItem) => fileItem.type === 'folder');
          folderId = data[0].id;
          folderName = data[0].name;
          data[0].title = folderName;
          this.props.updateGoogleFolderFn(data[0], folderId);
          data = this.props.editData.set('targetFolder', folderId);
          return this.props.editFn(data);
        }}
        buttonProps={{
          bsStyle: 'default',
          bsSize: bsize
        }}
        views={[
          ViewTemplates.rootFolder,
          ViewTemplates.sharedFolders,
          ViewTemplates.starredFolders,
          ViewTemplates.recent
        ]}
      />
    );
  },

  _renderSelect(options, prop) {
    let bsize = 'small';
    if (this.props.renderToModal) {
      bsize = 'medium';
    }

    return (
      <Input
        bsSize={bsize}
        type="select"
        value={
          (this.props.editData && this.props.editData.get(prop)) || options[0]
        }
        onChange={(e) => {
          const { value } = e.target;
          const data = this.props.editData.set(prop, value);
          return this.props.editFn(data);
        }}
      >
        {_.map(options, (label) => (
          <option title={tooltips[label]} value={label} key={label}>
            {label}
          </option>
        ))}
      </Input>
    );
  }
});
