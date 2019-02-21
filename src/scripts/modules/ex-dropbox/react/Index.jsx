import _ from 'underscore';
import React from 'react';
import moment from 'moment';

import AuthorizeModal from '../../components/react/components/DropboxAuthorizeModal';
import FileSelectorModal from './DropboxFileSelectorModal';
import RunButtonModal from '../../components/react/components/RunComponentButton';

import classnames from 'classnames';
import ComponentDescription from '../../components/react/components/ComponentDescription';
import DeleteConfigurationButton from '../../components/react/components/DeleteConfigurationButton';
import LatestVersions from '../../components/react/components/SidebarVersionsWrapper';

import SapiTableLinkEx from '../../components/react/components/StorageApiTableLinkEx';
import actions from '../../components/InstalledComponentsActionCreators';

import InstalledComponentsStore from '../../components/stores/InstalledComponentsStore';
import ExDropboxStore from '../stores/ExDropboxStore';
import OAuthStore from '../../components/stores/OAuthStore';
import ExDropboxActions from '../actions/ExDropboxActionCreators';
import OAuthActions from '../../components/OAuthActionCreators';
import createStoreMixin from '../../../react/mixins/createStoreMixin';
import RoutesStore from '../../../stores/RoutesStore';
import StorageActionCreators from '../../components/StorageActionCreators';
import StorageBucketsStore from '../../components/stores/StorageBucketsStore';
import SidebarJobsContainer from '../../components/react/components/SidebarJobsContainer';
import ComponentsMetadata from '../../components/react/components/ComponentMetadata';
import { fromJS, Map, List } from 'immutable';
import Confirm from '../../../react/common/Confirm';
import ActivateDeactivateButton from '../../../react/common/ActivateDeactivateButton';
import { Loader } from '@keboola/indigo-ui';
import { MD5 } from 'crypto-js';

import {
  getBucketsForSelection,
  getDestinationName,
  listBucketNames,
  filterBuckets,
  sortTimestampsInAscendingOrder,
  sortTimestampsInDescendingOrder
} from '../actions/ApplicationActions';

const componentId = 'ex-dropbox';

export default React.createClass({

  mixins: [createStoreMixin(InstalledComponentsStore, OAuthStore, ExDropboxStore, StorageBucketsStore)],

  getStateFromStores() {
    let configId = RoutesStore.getCurrentRouteParam('config');
    let configData = InstalledComponentsStore.getConfigData(componentId, configId);
    let localState = InstalledComponentsStore.getLocalState(componentId, configId);
    let parameters = configData.get('parameters', Map());
    let dropboxFiles = ExDropboxStore.getCsvFiles();
    let keboolaBuckets = StorageBucketsStore.getAll();
    let isSaving = InstalledComponentsStore.isSavingConfigData(componentId, configId);
    let selectedInputBucket = localState.get('selectedInputBucket', Map());
    let selectedDropboxFiles = localState.get('selectedDropboxFiles', Map());
    let isDefaultBucketSelected = localState.get('isDefaultBucketSelected', true);
    let credentials = OAuthStore.getCredentials(componentId, configId);
    let hasCredentials = OAuthStore.hasCredentials(componentId, configId);
    let isDeletingCredentials = OAuthStore.isDeletingCredetials(componentId, configId);

    return {
      configId: configId,
      configData: configData,
      parameters: parameters,
      localState: localState,
      dropboxFiles: dropboxFiles,
      keboolaBuckets: keboolaBuckets,
      selectedInputBucket: selectedInputBucket,
      selectedDropboxFiles: selectedDropboxFiles,
      credentials: credentials,
      isDefaultBucketSelected: isDefaultBucketSelected,
      isSaving: isSaving,
      hasCredentials: hasCredentials,
      isDeletingCredentials: isDeletingCredentials
    };
  },

  getInitialState() {
    return {
      showFileSelectorModal: false
    };
  },

  openFileSelectorModal() {
    this.setState({
      showFileSelectorModal: true
    });
  },

  closeFileSelectorModal() {
    this.setState({
      showFileSelectorModal: this.state.isSaving
    });

    this.updateLocalState(['selectedDropboxFiles'], fromJS([]));
    this.updateLocalState(['selectedInputBucket'], '');
  },

  componentDidMount() {
    if (this.state.hasCredentials) {
      let data = this.state.credentials.get('data');
      let token = JSON.parse(data).access_token;

      ExDropboxActions.getListOfCsvFiles(token);
      StorageActionCreators.loadBucketsForce();
      this.updateAndSaveConfigData(['parameters', 'config', '#credentials'], token);
    }
  },

  render() {
    return (
      <div className="container-fluid">
        {this.renderMainContent()}
        {this.renderSideBar()}
      </div>
    );
  },

  renderMainContent() {
    const hasFiles = this.state.configData.hasIn(['parameters', 'config', 'dropboxFiles']);
    const filesCount = hasFiles ? this.state.configData.getIn(['parameters', 'config', 'dropboxFiles']).count() : 0;

    return (
      <div className="col-md-9 kbc-main-content">
        {this.renderComponentDescription(hasFiles, filesCount)}
        {this.renderConfigSummary()}
        {this.renderDropboxLoginInformation()}
        {this.renderInitialSelectionOfFiles(hasFiles, filesCount)}
      </div>
    );
  },

  renderComponentDescription(hasFiles, filesCount) {
    const renderStandardFileSelection = hasFiles && filesCount > 0 ? this.renderFileSelectorModal() : null;
    return (
      <div className="row kbc-header">
        <div className="col-sm-8">
          <ComponentDescription
            componentId={componentId}
            configId={this.state.configId}
          />
        </div>
        <div className="col-sm-4 kbc-buttons">
          {renderStandardFileSelection}
        </div>
      </div>
    );
  },

  renderFileSelectorModal() {
    if (this.state.hasCredentials) {
      return (
        <div>
          <a onClick={this.openFileSelectorModal}>
            <span className="btn btn-success">
              <i className="kbc-icon-plus"/>
              New Files
            </span>
          </a>
          <FileSelectorModal
            show={this.state.showFileSelectorModal}
            onHide={this.closeFileSelectorModal}
            dropboxFiles={this.state.dropboxFiles.get('fileNames')}
            keboolaBuckets={this.getInputBuckets()}
            configId={this.state.configId}
            selectedCsvFiles={this.getSelectedCsvFiles}
            selectedInputBucket={this.getSelectedBucket}
            handleCsvSelectChange={this.handleCsvSelectChange}
            handleBucketChange={this.handleInputBucketChange}
            canSaveConfig={this.canSaveConfig}
            saveConfig={this.saveConfig}
            isSaving={this.state.isSaving}
            cancelConfig={this.cancelConfig}
          />
        </div>
      );
    }
  },

  renderConfigSummary() {
    const hasSelectedFiles = this.state.configData.hasIn(['parameters', 'config', 'dropboxFiles']);
    const selectedFiles = hasSelectedFiles ? this.state.configData.getIn(['parameters', 'config', 'dropboxFiles']) : List();

    if (this.state.hasCredentials && hasSelectedFiles && selectedFiles.count() > 0) {
      return (
        <div className="section">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Dropbox File</th>
                <th>Bucket</th>
                <th />
                <th>Output Table</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {
                selectedFiles.toJS().map((table, index) => {
                  const handleDeletingSingleElement = this.handleDeletingSingleElement.bind(this, index);
                  const handleUploadingSingleElement = this.handleUploadingSingleElement.bind(this, index);
                  return (
                    <tr key={index}>
                      <td>{table.file}</td>
                      <td>{table.bucket}</td>
                      <td>&gt;</td>
                      <td><SapiTableLinkEx tableId={table.output} /></td>
                      <td className="text-right">
                        {this.state.isSaving ? <Loader /> : <button className="btn btn-link" onClick={handleDeletingSingleElement}><i className="fa kbc-icon-cup" /></button>}
                        <RunButtonModal
                          title="Upload"
                          icon="fa fa-fw fa-play"
                          mode="button"
                          component="ex-dropbox"
                          runParams={handleUploadingSingleElement}
                        >
                        You are about to upload <strong>1 csv file</strong> from your Dropbox.
                        The result will be stored into selected buckets.
                        </RunButtonModal>
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>
      );
    }
  },

  renderDropboxLoginInformation() {
    if (!this.state.hasCredentials) {
      return (
        <div className="row component-empty-state text-center">
          <p>No Dropbox account authorized!</p>
          <AuthorizeModal
            configId={this.state.configId}
            componentId={componentId}
            redirectRouterPath="ex-dropbox-oauth-redirect"
          />
        </div>
      );
    }
  },


  // This component will popup once the authorization is done, but no file has been selected yet.
  renderInitialSelectionOfFiles(hasFiles, filesCount) {
    if (this.state.hasCredentials && (!hasFiles || filesCount === 0)) {
      return (
        <div className="row component-empty-state text-center">
          <p>No files selected yet.</p>
          {this.renderFileSelectorModal()}
        </div>
      );
    }
  },

  getAuthorizationInformation() {
    if (this.state.hasCredentials) {
      return (
        <span>Authorized for <strong>{this.state.credentials.get('description')}</strong></span>
      );
    } else {
      return (
        <small className="text-muted">Not yet authorized</small>
      );
    }
  },

  runParams() {
    return () => ({config: this.state.configId});
  },

  renderSideBar() {
    return (
      <div className="col-md-3 kbc-main-sidebar">
        <div className="kbc-buttons kbc-text-light">
          <p>{this.getAuthorizationInformation()}</p>
          <ComponentsMetadata componentId={componentId} configId={this.state.configId} />
        </div>
        <ul className="nav nav-stacked">
          <li className={classnames({disabled: !this.canRunUpload()})}>
            <RunButtonModal
              title="Run"
              icon="fa-play"
              mode="link"
              component="ex-dropbox"
              disabled={!this.canRunUpload()}
              disabledReason="A Dropbox account must be authorized and a table selected."
              runParams={this.runParams()}
            >
              You are about to run upload of <strong>{this.state.configData.getIn(['parameters', 'config', 'dropboxFiles'], List()).count()} csv files</strong> from your Dropbox.
              The result will be stored into selected bucket(s).
            </RunButtonModal>
          </li>
          <li>
            {this.renderResetAuthorization()}
          </li>
          <li>
            <DeleteConfigurationButton
              componentId={componentId}
              configId={this.state.configId}
              customDeleteFn={this.deleteCredentials}
            />
          </li>
        </ul>
        <SidebarJobsContainer
          componentId={componentId}
          configId={this.state.configId}
          limit={3}
        />
        <LatestVersions
          limit={3}
          componentId={componentId}
        />
      </div>
    );
  },

  renderResetAuthorization() {
    if (this.state.hasCredentials) {
      let description = this.state.credentials.get('description');
      return (
        <ActivateDeactivateButton
          mode="link"
          activateTooltip=""
          deactivateTooltip="Reset Authorization"
          isActive={true}
          isPending={this.state.isDeletingCredentials}
          onChange={this.deleteCredentials}
        >
          <Confirm
            text={`Do you really want to reset the authorization of ${description}? The tables configured for upload will not be reset.`}
            title={`Reset Authorization ${description}`}
            buttonLabel="Reset"
            onConfirm={this.deleteCredentials}
          />
        </ActivateDeactivateButton>
      );
    } else {
      return (
        <div>
          <AuthorizeModal
            configId={this.state.configId}
            componentId={componentId}
            renderOpenButtonAsLink={true}
            redirectRouterPath="ex-dropbox-oauth-redirect"
          />
        </div>
      );
    }
  },

  canSaveConfig() {
    let hasLocalConfigDataBucket = this.state.localState.has('selectedInputBucket');
    let localConfigDataBucket = this.state.localState.get('selectedInputBucket');

    // We can save new config whether user changed files selection.
    // On the other hand the bucket may be changed, but we also have to make sure the bucket is set.
    return !(hasLocalConfigDataBucket && this.getLocalConfigDataFilesCount() > 0 && localConfigDataBucket !== '');
  },

  getLocalConfigDataFilesCount() {
    if (!this.state.localState.has('selectedDropboxFiles')) {
      return 0;
    }
    return fromJS(this.state.localState.get('selectedDropboxFiles')).size;
  },

  updateParameters(newParameters) {
    this.updateAndSaveConfigData(['parameters'], newParameters);
  },

  updateAndSaveConfigData(path, data) {
    let newData = this.state.configData.setIn(path, data);
    return actions.saveComponentConfigData(componentId, this.state.configId, newData);
  },

  saveConfig() {
    const hasSelectedBucket = this.state.localState.has('selectedInputBucket');
    const hasSelectedDropboxFiles = this.state.localState.has('selectedDropboxFiles');

    if (hasSelectedBucket && hasSelectedDropboxFiles) {
      const localBucket = this.state.localState.get('selectedInputBucket');
      const localState = this.state.localState.get('selectedDropboxFiles').map((dropboxFile) => {
        return {
          file: dropboxFile,
          bucket: localBucket,
          timestamp: moment().unix(),
          hash: MD5(dropboxFile + localBucket).toString(),
          output: localBucket + '.' + getDestinationName(dropboxFile)
        };
      });

      const oldState = this.state.configData.getIn(['parameters', 'config', 'dropboxFiles'], Map()).toJS();
      const mergedState = [...oldState, ...localState];

      // We need to dedup the state in case there has been selected the same combination of file + bucket.
      // We also need to keep the older files to make sure we keep consistent file names in case of duplicate in names.
      const dedupState = _.values(_.indexBy(mergedState.sort(sortTimestampsInDescendingOrder), 'hash'));

      // We need to make sure the final name will be unique.
      const newState = _.flatten(_.values(_.groupBy(dedupState, 'output')).map((arrayOfFileNames) =>{
        if (arrayOfFileNames.length === 1) {
          return arrayOfFileNames;
        } else {
          return arrayOfFileNames.sort(sortTimestampsInAscendingOrder).map((fileName, index) => {
            if (index > 0) {
              return Object.assign({}, fileName, {
                output: fileName.output + fileName.hash.slice(0, 4)
              });
            }
            return fileName;
          });
        }
      })).sort(sortTimestampsInAscendingOrder);

      return this.updateAndSaveConfigData(['parameters', 'config', 'dropboxFiles'], fromJS(newState));
    }
  },

  cancelConfig() {
    this.updateLocalState(['selectedDropboxFiles'], fromJS([]));
    this.updateLocalState(['selectedInputBucket'], '');
  },

  canRunUpload() {
    return (this.state.configData.hasIn(['parameters', 'config', 'dropboxFiles']) && this.state.configData.getIn(['parameters', 'config', 'dropboxFiles']).count() > 0 && this.state.hasCredentials);
  },

  getSelectedCsvFiles() {
    let selectedDropboxFiles = [];
    let localConfigDataFiles = this.state.localState.get('selectedDropboxFiles');
    let hasLocalConfigDataFiles = this.state.localState.has('selectedDropboxFiles');

    if (hasLocalConfigDataFiles) {
      localConfigDataFiles.map((fileName) => {
        selectedDropboxFiles.push(fileName);
      });
    }

    return selectedDropboxFiles;
  },

  getSelectedBucket() {
    let localConfigDataBucket = this.state.localState.get('selectedInputBucket');
    let hasLocalConfigDataBucket = this.state.localState.has('selectedInputBucket');

    if (hasLocalConfigDataBucket && localConfigDataBucket !== '') {
      return localConfigDataBucket;
    }

    return '';
  },

  handleDeletingSingleElement(element) {
    if (this.state.configData.hasIn(['parameters', 'config', 'dropboxFiles'])) {
      let newConfig = this.state.configData.getIn(['parameters', 'config', 'dropboxFiles']).delete(element);
      this.updateAndSaveConfigData(['parameters', 'config', 'dropboxFiles'], newConfig);
    }
  },

  handleUploadingSingleElement(element) {
    if (this.state.configData.hasIn(['parameters', 'config', 'dropboxFiles'])) {
      const selectedFile = this.state.configData.getIn(['parameters', 'config', 'dropboxFiles']).get(element).toJS();
      return {
        configData: {
          parameters: {
            config: {
              dropboxFiles: [{
                file: selectedFile.file,
                bucket: selectedFile.bucket,
                output: selectedFile.output
              }],
              '#credentials': this.state.configData.getIn(['parameters', 'config', '#credentials'])
            }
          }
        }
      };
    }
  },

  getInputBuckets() {
    return getBucketsForSelection(listBucketNames(filterBuckets(this.state.keboolaBuckets)));
  },

  handleCsvSelectChange(values) {
    this.updateLocalState(['selectedDropboxFiles'], values);
  },

  handleInputBucketChange(value) {
    this.updateLocalState(['selectedInputBucket'], value);
  },

  deleteCredentials() {
    OAuthActions.deleteCredentials(componentId, this.state.configId);
  },

  updateLocalState(path, data) {
    let newLocalState = this.state.localState.setIn(path, data);
    actions.updateLocalState(componentId, this.state.configId, newLocalState, path);
  }
});
