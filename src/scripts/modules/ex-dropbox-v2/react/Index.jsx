import _ from 'underscore';
import React from 'react';
import createReactClass from 'create-react-class';
import moment from 'moment';
import byteConverter from 'byte-converter';
import FileSelectorModal from './DropboxFileSelectorModal';
import RunButtonModal from '../../components/react/components/RunComponentButton';
import string from '../../../utils/string';
import classnames from 'classnames';
import ComponentDescription from '../../components/react/components/ComponentDescription';
import DeleteConfigurationButton from '../../components/react/components/DeleteConfigurationButton';
import LatestVersions from '../../components/react/components/SidebarVersionsWrapper';
import getDefaultBucket from '../../../utils/getDefaultBucket';
import SapiTableLinkEx from '../../components/react/components/StorageApiTableLinkEx';
import actions from '../../components/InstalledComponentsActionCreators';

import { MD5 } from 'crypto-js';
import { Loader } from '@keboola/indigo-ui';
import { fromJS, Map, List } from 'immutable';

import InstalledComponentsStore from '../../components/stores/InstalledComponentsStore';
import ExDropboxStore from '../stores/ExDropboxStore';
import createStoreMixin from '../../../react/mixins/createStoreMixin';
import RoutesStore from '../../../stores/RoutesStore';
// import StorageActionCreators from '../../components/StorageActionCreators';
// import StorageBucketsStore from '../../components/stores/StorageBucketsStore';
import SidebarJobsContainer from '../../components/react/components/SidebarJobsContainer';
import ComponentsMetadata from '../../components/react/components/ComponentMetadata';

import {
  getDestinationName,
  sortTimestampsInAscendingOrder,
  sortTimestampsInDescendingOrder
} from '../actions/ApplicationActions';

const componentId = 'radektomasek.ex-dropbox-v2';

export default createReactClass({

  mixins: [createStoreMixin(InstalledComponentsStore, ExDropboxStore)],

  getStateFromStores() {
    let configId = RoutesStore.getCurrentRouteParam('config');
    let configData = InstalledComponentsStore.getConfigData(componentId, configId);
    let localState = InstalledComponentsStore.getLocalState(componentId, configId);
    let parameters = configData.get('parameters', Map());
    let dropboxFiles = ExDropboxStore.getCsvFiles();
    let isSaving = InstalledComponentsStore.isSavingConfigData(componentId, configId);
    let selectedDropboxFiles = localState.get('selectedDropboxFiles', Map());

    return {
      defaultBucket: getDefaultBucket('in', componentId, configId),
      configId: configId,
      isSaving: isSaving,
      configData: configData,
      parameters: parameters,
      localState: localState,
      dropboxFiles: dropboxFiles,
      selectedDropboxFiles: selectedDropboxFiles
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
  },

  render() {
    return (
      <div className="container-fluid">
        {this.renderMainContent()}
        {this.renderSideBar()}
      </div>
    );
  },

  hasFiles() {
    const hasFiles = this.state.configData.hasIn(['parameters', 'config', 'dropboxFiles']);
    const filesCount = hasFiles ? this.state.configData.getIn(['parameters', 'config', 'dropboxFiles']).count() : 0;
    return filesCount > 0;
  },

  renderMainContent() {
    return (
      <div className="col-md-9 kbc-main-content">
        {this.renderComponentDescription()}
        {this.renderConfigSummary()}
        {this.renderInitialSelectionOfFiles()}
      </div>
    );
  },

  renderComponentDescription() {
    return (
      <div className="kbc-inner-padding kbc-inner-padding-with-bottom-border">
        <ComponentDescription
          componentId={componentId}
          configId={this.state.configId}
        />
      </div>
    );
  },

  renderFileSelectorModal() {
    return (
      <div>
        <a onClick={this.openFileSelectorModal}>
          <span className="btn btn-success"> <i className="kbc-icon-plus"/>New file</span>
        </a>
        <FileSelectorModal
          configId={this.state.configId}
          saveConfig={this.saveConfig}
          isSaving={this.state.isSaving}
          cancelConfig={this.cancelConfig}
          canSaveConfig={this.canSaveConfig}
          onHide={this.closeFileSelectorModal}
          show={this.state.showFileSelectorModal}
          handleCsvSelectChange={this.handleCsvSelectChange}

          selectedDropboxFiles={this.getSelectedCsvFiles()}
        />
      </div>
    );
  },

  renderConfigSummary() {
    const hasSelectedFiles = this.state.configData.hasIn(['parameters', 'config', 'dropboxFiles']);
    const selectedFiles = hasSelectedFiles ? this.state.configData.getIn(['parameters', 'config', 'dropboxFiles']) : List();
    const converter = byteConverter.converterBase10;
    if (hasSelectedFiles && selectedFiles.count() > 0) {
      return (
        <div className="section">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Dropbox File</th>
                <th>Size</th>
                <th />
                <th>Output Table</th>
                <th> {this.renderFileSelectorModal()}</th>
              </tr>
            </thead>
            <tbody>
              {
                selectedFiles.toJS().map((table, index) => {
                  const handleDeletingSingleElement = this.handleDeletingSingleElement.bind(this, index);
                  const handleUploadingSingleElement = this.handleUploadingSingleElement.bind(this, index);
                  const {defaultBucket} = this.state;
                  return (
                    <tr key={index}>
                      <td>
                        {table.name}
                      </td>
                      <td>{converter(table.bytes, 'B', 'MB').toFixed(5)} MB</td>
                      <td>&gt;</td>
                      <td><SapiTableLinkEx tableId={defaultBucket + '.' + table.output} /></td>
                      <td className="text-right">
                        {this.state.isSaving ? <Loader /> : <button className="btn btn-link" onClick={handleDeletingSingleElement}><i className="fa kbc-icon-cup" /></button>}
                        <RunButtonModal
                          title="Upload"
                          icon="fa fa-fw fa-play"
                          mode="button"
                          component={componentId}
                          runParams={handleUploadingSingleElement}
                        >
                          You are about to run an extraction of <strong>{table.name}</strong> from Dropbox.
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

  // This component will popup once the authorization is done, but no file has been selected yet.
  renderInitialSelectionOfFiles() {
    if (!this.hasFiles()) {
      return (
        <div className="row component-empty-state text-center">
          <p>No files selected yet.</p>
          {this.renderFileSelectorModal()}
        </div>
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
          <ComponentsMetadata componentId={componentId} configId={this.state.configId} />
        </div>
        <ul className="nav nav-stacked">
          <li className={classnames({disabled: !this.canRunUpload()})}>
            <RunButtonModal
              title="Run"
              icon="fa-play"
              mode="link"
              component={componentId}
              disabled={!this.canRunUpload()}
              disabledReason="A Dropbox file must be selected."
              runParams={this.runParams()}
            >
              You are about to run an extraction of all configured CSV files from Dropbox.
            </RunButtonModal>
          </li>
          <li>
            <DeleteConfigurationButton
              componentId={componentId}
              configId={this.state.configId}
              customDeleteFn={() => {}}
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

  canSaveConfig() {
    // We can save new config whether user changed files selection.
    // On the other hand the bucket may be changed, but we also have to make sure the bucket is set.
    return !(this.getLocalConfigDataFilesCount() > 0);
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

  updateAndSaveConfigData(path, data, changeDescription) {
    let newData = this.state.configData.setIn(path, data);
    return actions.saveComponentConfigData(componentId, this.state.configId, newData, changeDescription);
  },

  saveConfig(forceData) {
    const hasSelectedDropboxFiles = !!forceData || this.state.localState.has('selectedDropboxFiles');
    let changeDescription = '';
    const data = forceData || this.state.localState.get('selectedDropboxFiles');
    if (hasSelectedDropboxFiles) {
      const localState = data.map((dropboxFile) => {
        changeDescription = `Create file ${dropboxFile.name}`;
        const output = dropboxFile.manualInsert ? dropboxFile.name : string.sanitizeKbcTableIdString(getDestinationName(dropboxFile.name));
        return {
          bytes: dropboxFile.bytes,
          '#link': dropboxFile.link,
          name: dropboxFile.name,
          timestamp: moment().unix(),
          hash: MD5(dropboxFile.name).toString(),
          output: output
        };
      });

      const oldState = this.state.configData.getIn(['parameters', 'config', 'dropboxFiles'], List()).toJS();
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

      return this.updateAndSaveConfigData(['parameters', 'config', 'dropboxFiles'], fromJS(newState), changeDescription);
    }
  },

  cancelConfig() {
    this.updateLocalState(['selectedDropboxFiles'], fromJS([]));
  },

  canRunUpload() {
    return (this.state.configData.hasIn(['parameters', 'config', 'dropboxFiles']) && this.state.configData.getIn(['parameters', 'config', 'dropboxFiles']).count() > 0);
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

  handleDeletingSingleElement(element) {
    if (this.state.configData.hasIn(['parameters', 'config', 'dropboxFiles'])) {
      const name = this.state.configData.getIn(['parameters', 'config', 'dropboxFiles', element]).get('name');
      const changeDescription = `Delete file ${name}`;
      let newConfig = this.state.configData.getIn(['parameters', 'config', 'dropboxFiles']).delete(element);

      this.updateAndSaveConfigData(['parameters', 'config', 'dropboxFiles'], newConfig, changeDescription);
    }
  },

  handleUploadingSingleElement(element) {
    if (this.state.configData.hasIn(['parameters', 'config', 'dropboxFiles'])) {
      const selectedFile = this.state.configData.getIn(['parameters', 'config', 'dropboxFiles']).get(element).toJS();
      return {
        config: this.state.configId,
        configData: {
          parameters: {
            config: {
              dropboxFiles: [{
                '#link': selectedFile['#link'],
                name: selectedFile.name,
                output: selectedFile.output
              }]
            }
          }
        }
      };
    }
  },

  handleCsvSelectChange(values) {
    this.updateLocalState(['selectedDropboxFiles'], values);
  },


  updateLocalState(path, data) {
    let newLocalState = this.state.localState.setIn(path, data);
    actions.updateLocalState(componentId, this.state.configId, newLocalState, path);
  }
});
