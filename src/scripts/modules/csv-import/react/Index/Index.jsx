import React from 'react';
import createReactClass from 'create-react-class';
import { Alert } from 'react-bootstrap';

// stores
import ComponentStore from '../../../components/stores/ComponentsStore';
import InstalledComponentsStore from '../../../components/stores/InstalledComponentsStore';
import StorageTablesStore from '../../../components/stores/StorageTablesStore';
import StorageBucketsStore from '../../../components/stores/StorageBucketsStore';
import RoutesStore from '../../../../stores/RoutesStore';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import storeProvisioning from '../../storeProvisioning';

// actions
import actionsProvisioning from '../../actionsProvisioning';

// specific components
import Upload from '../components/Upload';
// import SettingsStatic from '../components/SettingsStatic';
import Settings from '../components/Settings';
import SaveButtons from '../../../../react/common/SaveButtons';

// global components
import ComponentDescription from '../../../components/react/components/ComponentDescription';
import ComponentMetadata from '../../../components/react/components/ComponentMetadata';
import DeleteConfigurationButton from '../../../components/react/components/DeleteConfigurationButton';
import ScheduleConfigurationButton from '../../../components/react/components/ScheduleConfigurationButton';
import LatestVersions from '../../../components/react/components/SidebarVersionsWrapper';

// utils
import {getDefaultTable} from '../../utils';

// CONSTS
const COMPONENT_ID = 'keboola.csv-import';

/*

notes

- vpravo by to mohlo ukazovat importní joby storage (nevím jak)

 */

export default createReactClass({
  // TODO ještě store na joby ve storage
  mixins: [createStoreMixin(InstalledComponentsStore, StorageTablesStore, StorageBucketsStore)],

  getStateFromStores() {
    const configId = RoutesStore.getCurrentRouteParam('config');
    const component = ComponentStore.getComponent(COMPONENT_ID);
    const store = storeProvisioning(configId);
    const actions = actionsProvisioning(configId);
    return {
      component: component,
      configId: configId,
      actions: actions,
      tables: StorageTablesStore.getAll(),
      isUploaderValid: store.isUploaderValid,
      isUploaderFileTooBig: store.isUploaderFileTooBig,
      isUploaderFileInvalidFormat: store.isUploaderFileInvalidFormat,
      localState: store.getLocalState(),
      settings: store.settings
    };
  },

  renderUploadResult() {
    const resultMessage = this.state.localState.get('resultMessage', '');
    const resultState = this.state.localState.get('resultState', '');
    if (resultMessage) {
      var alertStyle = 'info';
      if (resultState === 'error') {
        alertStyle = 'danger';
      } else if (resultState === 'success') {
        alertStyle = 'success';
      }
      return (
        <Alert bsStyle={alertStyle}>
          <button type="button" className="close" onClick={this.state.actions.dismissResult}>
            <span aria-hidden="true">×</span>
            <span className="sr-only">Close</span>
          </button>
          {resultMessage}
        </Alert>
      );
    }
    return null;
  },

  renderUploader() {
    return (
      <div>
        {this.renderUploadResult()}
        <Upload
          onStartUpload={this.state.actions.startUpload}
          onChange={this.state.actions.setFile}
          isValid={this.state.isUploaderValid}
          isFileTooBig={this.state.isUploaderFileTooBig}
          isFileInvalidFormat={this.state.isUploaderFileInvalidFormat}
          isUploading={this.state.localState.get('isUploading', false)}
          uploadingMessage={this.state.localState.get('uploadingMessage', '')}
          uploadingProgress={this.state.localState.get('uploadingProgress', 0)}
          key={this.state.localState.get('fileInputKey', 0)}
          disabled={this.state.localState.get('isChanged', false)}
        />
      </div>
    );
  },

  renderSettings() {
    return (
      <Settings
        settings={this.state.settings}
        onChange={this.state.actions.editChange}
        tables={this.state.tables}
        defaultTable={getDefaultTable(this.state.configId)}
        disabled={this.state.localState.get('isSaving', false)}
        destinationEditing={this.state.localState.get('isDestinationEditing', false)}
        onDestinationEdit={this.state.actions.destinationEdit}
      />
    );
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="col-md-9 kbc-main-content">
          <div className="kbc-inner-padding kbc-inner-padding-with-bottom-border">
            <ComponentDescription
              componentId={COMPONENT_ID}
              configId={this.state.configId}
            />
          </div>
          <div className="kbc-inner-padding kbc-inner-padding-with-bottom-border">
            <h3>Upload CSV File</h3>
            {this.renderUploader()}
          </div>
          <div className="kbc-inner-padding kbc-inner-padding-with-bottom-border">
            <h3 style={{lineHeight: '32px'}}>
              CSV Upload Settings
              <span className="pull-right">
                <SaveButtons
                  isSaving={this.state.localState.get('isSaving', false)}
                  isChanged={this.state.localState.get('isChanged', false)}
                  onReset={this.state.actions.editReset}
                  onSave={this.state.actions.editSave}
                />
              </span>
            </h3>
            {this.renderSettings()}
          </div>
        </div>
        <div className="col-md-3 kbc-main-sidebar">
          <ComponentMetadata
            componentId={COMPONENT_ID}
            configId={this.state.configId}
          />
          <ul className="nav nav-stacked">
            <li>
              <DeleteConfigurationButton
                componentId={COMPONENT_ID}
                configId={this.state.configId}
              />
            </li>
            <li>
              <ScheduleConfigurationButton
                componentId={COMPONENT_ID}
                configId={this.state.configId}
              />
            </li>
          </ul>
          <LatestVersions
            componentId="keboola.csv-import"
          />
        </div>
      </div>
    );
  }
});
