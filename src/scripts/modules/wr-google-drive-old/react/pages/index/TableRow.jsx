import React from 'react';
import _ from 'underscore';
import { fromJS } from 'immutable';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import { Loader } from '@keboola/indigo-ui';

import Confirm from '../../../../../react/common/Confirm';
import Tooltip from '../../../../../react/common/Tooltip';
import RunButtonModal from '../../../../components/react/components/RunComponentButton';
import SapiTableLinkEx from '../../../../components/react/components/StorageApiTableLinkEx';

import RowEditor from './RowEditor';

const tooltips = {
  file: 'uploads the selected table as a csv file',
  sheet: 'uploads the selected table as a google drive spreadsheet',
  update: 'always update the same file or sheet; if it does not exist, create one',
  create: 'always create a new file with a unique name by appending the current date and time to the name.'
};


export default React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    table: React.PropTypes.object.isRequired,
    file: React.PropTypes.object.isRequired,
    configId: React.PropTypes.string.isRequired,
    email: React.PropTypes.string.isRequired,
    googleInfo: React.PropTypes.object.isRequired,
    editData: React.PropTypes.object.isRequired,
    isSavingFn: React.PropTypes.bool,
    editFn: React.PropTypes.func.isRequired,
    saveFn: React.PropTypes.func.isRequired,
    loadGoogleInfoFn: React.PropTypes.func.isRequired,
    deleteRowFn: React.PropTypes.func.isRequired,
    isLoadingGoogleInfoFn: React.PropTypes.func.isRequired,
    isDeleted: React.PropTypes.bool,
    updateGoogleFolderFn: React.PropTypes.func.isRequired
  },


  render() {
    if (!!this.props.editData) {
      return this._renderEditFile();
    }
    if (!this.props.file) {
      return this._renderEmptyFile();
    }
    return this._renderStaticFile();
  },

  _renderStaticFile() {
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
        <span className="td">
          <span>
            {this.props.file.get('title')}
            {this._renderPreviewLink()}
          </span>
        </span>
        <span className="td">
          <Tooltip tooltip={tooltips[this.props.file.get('operation')]}>
            {<span>
              {this.props.file.get('operation')}
            </span>}
          </Tooltip>
        </span>
        <span className="td">
          <Tooltip tooltip={tooltips[this.props.file.get('type')]}>
            {<span>
              {this.props.file.get('type')}
            </span>}
          </Tooltip>
        </span>
        <span className="td">
          {this._renderTargetfolder()}
        </span>
        {this.props.isSavingFn() ?
          <span className="td">
            <Loader />
          </span>
          :
          <span className="td text-right kbc-no-wrap">
            {!this.props.isDeleted && (
              <button
                className="btn btn-link"
                onClick={() => {
                  return this.props.editFn(this.props.file);
                }}>
                <i className="fa fa-fw kbc-icon-pencil" />
              </button>
            )}
            <Confirm
              key={this.props.table.get('id')}
              title="Remove table configuration."
              text="You are about to remove the table from the writer configuration."
              buttonLabel="Remove"
              onConfirm={() => {
                const rowId = this.props.file.get('id');
                return this.props.deleteRowFn(rowId);
              }}>
              <button className="btn btn-link">
                <i className="kbc-icon-cup" />
              </button>
            </Confirm>
            {!this.props.isDeleted && this._renderRunButton()}
          </span>}
      </div>
    );
  },


  _renderEditFile() {
    return (
      <RowEditor
        table={this.props.table}
        editFn={this.props.editFn}
        editData={this.props.editData}
        isSavingFn={this.props.isSavingFn}
        email={this.props.email}
        googleInfo={this.props.googleInfo}
        saveFn={this.props.saveFn}
        updateGoogleFolderFn={this.props.updateGoogleFolderFn}
        renderToModal={false}
      />
    );
  },

  _renderEmptyFile() {
    const tableId = this.props.table.get('id');
    const tableName = this.props.table.get('name');
    const emptyFile = {
      title: tableName,
      tableId,
      operation: 'update',
      type: 'sheet'
    };
    return (
      <div className="tr">
        <span className="td">
          <SapiTableLinkEx tableId={this.props.table.get('id')}>
            {this.props.table.get('name')}
          </SapiTableLinkEx>
        </span>
        <span className="td">
          {''}
        </span>
        <span className="td">
          {''}
        </span>
        <span className="td">
          {''}
        </span>
        <span className="td">
          {''}
        </span>
        <span className="td">
          {''}
        </span>
        <span className="td text-right kbc-no-wrap">
          <button
            className="btn btn-link"
            onClick={() => {
              return this.props.editFn(fromJS(emptyFile));
            }}>
            <i className="fa fa-fw fa-plus" />
          </button>
        </span>
      </div>
    );
  },


  _renderRunButton() {
    return (
      <Tooltip tooltip="Upload a table to Google Drive">
        <RunButtonModal
          title="Run"
          tooltip={`Upload ${this.props.table.get('id')}`}
          mode="button"
          icon="fa fa-play fa-fw"
          component="wr-google-drive"
          runParams={() => {
            return {
              file: this.props.file.get('id'),
              config: this.props.configId
            };
          }}>
          {`You are about to run an upload of ${this.props.table.get('id')} to Google Drive.`}
        </RunButtonModal>
      </Tooltip>
    );
  },

  _renderPreviewLink() {
    const googleId = this.props.file && this.props.file.get('googleId');
    if (_.isEmpty(googleId)) {
      return null;
    }

    const googleInfo = this.props.googleInfo && this.props.googleInfo.get(googleId);
    if (!googleInfo) {
      return (
        <div className="kbc-no-wrap pull-right">
          {this.props.isLoadingGoogleInfoFn(googleId) ?
            <Loader />
            :
            <button
              style={{
                padding: '0'
              }}
              className="btn btn-link btn-sm"
              onClick={() => {
                return this.props.loadGoogleInfoFn(googleId);
              }}>
              <small>
                Link To Google Drive
              </small>
            </button>}
        </div>
      );
    }

    const url = googleInfo.get('alternateLink');
    const name = googleInfo.get('title') || googleInfo.get('originalFilename');
    return (
      <div>
        <a href={url} target="_blank">
          <small>
            {name}
          </small>
        </a>
      </div>
    );
  },

  _renderTargetfolder() {
    const folderId = this.props.file.get('targetFolder');
    if (!folderId) {
      return '/';
    }

    const folderName = this.props.googleInfo && this.props.googleInfo.get(folderId);
    if (!folderName) {
      return <Loader />;
    }
    return folderName.get('title');
  }
});
