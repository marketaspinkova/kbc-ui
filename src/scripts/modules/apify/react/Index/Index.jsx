import React from 'react';
import createReactClass from 'create-react-class';
import {Map} from 'immutable';
import ComponentEmptyState from '../../../components/react/components/ComponentEmptyState';
// stores
import storeProvisioning, {storeMixins} from '../../storeProvisioning';
import ComponentStore from '../../../components/stores/ComponentsStore';
import RoutesStore from '../../../../stores/RoutesStore';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import storageTablesStore from '../../../components/stores/StorageTablesStore';

// actions
import actionsProvisioning from '../../actionsProvisioning';

// ui components
import ComponentDescription from '../../../components/react/components/ComponentDescription';
import SapiTableLinkEx from '../../../components/react/components/StorageApiTableLinkEx';
import ComponentMetadata from '../../../components/react/components/ComponentMetadata';
import RunComponentButton from '../../../components/react/components/RunComponentButton';
import DeleteConfigurationButton from '../../../components/react/components/DeleteConfigurationButton';
import SidebarJobsContainer from '../../../components/react/components/SidebarJobsContainer';
import LatestVersions from '../../../components/react/components/SidebarVersionsWrapper';
import SetupModal from './SetupModal';
import { ExternalLink } from '@keboola/indigo-ui';
import { Controlled as CodeMirror } from 'react-codemirror2'

const COMPONENT_ID = 'apify.apify';

export default createReactClass({
  mixins: [createStoreMixin(...storeMixins)],

  getStateFromStores() {
    const configId = RoutesStore.getCurrentRouteParam('config');
    const store = storeProvisioning(configId);
    const actions = actionsProvisioning(configId);
    const component = ComponentStore.getComponent(COMPONENT_ID);

    return {
      allTables: storageTablesStore.getAll(),
      store: store,
      actions: actions,
      component: component,
      configId: configId,
      inputTableId: store.inputTable && store.inputTable.get('source'),
      localState: store.getLocalState()
    };
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
            {this.renderSetupModal()}
            {this.isConfigured() ?
              this.renderStatic()
              :
              this.renderStartSetup()
            }
          </div>
        </div>

        <div className="col-md-3 kbc-main-sidebar">
          <ComponentMetadata
            configId={this.state.configId}
            componentId={COMPONENT_ID}
          />
          <ul className="nav nav-stacked">
            <li className={!!this.invalidToRun() ? 'disabled' : null}>
              <RunComponentButton
                title="Run"
                component={COMPONENT_ID}
                mode="link"
                runParams={this.runParams()}
                disabled={!!this.invalidToRun()}
                disabledReason={this.invalidToRun()}
              >
                You are about to run an extraction.
              </RunComponentButton>
            </li>
            <li>
              <DeleteConfigurationButton
                componentId={COMPONENT_ID}
                configId={this.state.configId}
              />
            </li>
          </ul>
          <SidebarJobsContainer
            componentId={COMPONENT_ID}
            configId={this.state.configId}
            limit={3}
          />
          <LatestVersions
            limit={3}
            componentId={COMPONENT_ID}
          />
        </div>
      </div>
    );
  },

  isConfigured() {
    const params = this.state.store.parameters;
    const hasAuth = (!!params.get('userId') && !!params.get('#token')) || !!params.get('executionId');
    const hasCrawler =
      !!params.get('crawlerId') ||
      !!params.get('executionId') ||
      (params.get('actionType') === 'getDatasetItems' && params.get('datasetId')) ||
      (params.get('actionType') === 'runActor' && params.get('actId'));
    return hasAuth && hasCrawler;
  },

  renderSetupModal() {
    const {localState, actions, store} = this.state;
    const path = ['SetupModal'];
    const showPath = path.concat('show');
    const closeFn = () => {
      this.updateLocalState(showPath, false);
    };
    return (
      <SetupModal
        inputTableId={this.state.inputTableId}
        parameters={store.parameters}
        show={localState.getIn(showPath, false)}
        onHideFn={closeFn}
        {...actions.prepareLocalState(path.concat('data'))}
        loadCrawlers={actions.loadCrawlers}
        loadActors={actions.loadActors}
        onSave={(params, inputTable) => actions.saveConfig(params, inputTable).then(closeFn)}
        isSaving={localState.get('saving') || false}
      />
    );
  },

  showSetupModal() {
    this.updateLocalState('SetupModal', Map());
    this.updateLocalState(['SetupModal', 'show'], true);
  },

  renderStartSetup() {
    return (
      <ComponentEmptyState>
        <p> No Crawler configured.</p>
        <button className="btn btn-success" onClick={this.showSetupModal}>
          Configure Crawler
        </button>
      </ComponentEmptyState>
    );
  },

  renderStatic() {
    const parameters = this.state.store.parameters;
    const crawler = this.renderCrawlerStatic(parameters);
    const crawlerSettings = parameters.get('crawlerSettings', Map()) || Map();
    const user = <p className="form-control-static">{parameters.get('userId')}</p>;
    const settings = this.renderStaticJsonEditor(crawlerSettings.toJS());
    const bucketId = this.state.store.outputBucket;
    const tableId = `${bucketId}.crawler-result`;
    const resultsTable = <p className="form-control-static"><SapiTableLinkEx tableId={tableId} /></p>;
    const executionId = parameters.get('executionId');
    const inputTableId = this.state.inputTableId;
    const isGetDatasetAction = parameters.get('actionType') === 'getDatasetItems';
    const isActorAction = parameters.get('actionType') === 'runActor';
    const inputTableElement = (
      <p className="form-control-static">
        {inputTableId ?
          <SapiTableLinkEx tableId={inputTableId} />
          : 'N/A'
        }
      </p>
    );

    const crawlerFormGroup = (
      <span>
        {this.renderStaticFormGroup('User ID', user)}
        {this.renderStaticFormGroup('Crawler', crawler)}
        {this.renderStaticFormGroup('Input Table', inputTableElement)}
        {this.renderStaticFormGroup('Crawler Settings', settings)}
      </span>
    );

    let resultForm = crawlerFormGroup;

    if (isGetDatasetAction) {
      resultForm = (
        <span>
          {this.renderStaticFormGroup('User ID', user)}
          {this.renderStaticFormGroup('Dataset', <p className="form-control-static">{parameters.get('datasetId')}</p>)}
        </span>
      );
    }

    if (!!executionId) {
      resultForm = this.renderStaticFormGroup('Execution ID', <p className="form-control-static">{executionId}</p>);
    }

    if (isActorAction) {
      const inputJson = parameters.get('input', Map());
      const actorInput = this.renderStaticJsonEditor(inputJson.toJS());
      resultForm = (
        <span>
          {this.renderStaticFormGroup('User ID', user)}
          {this.renderStaticFormGroup('Actor ID', this.renderActorStatic(parameters))}
          {this.renderStaticFormGroup('Input Table', inputTableElement)}
          {this.renderStaticFormGroup('Memory', <p className="form-control-static">{parameters.get('memory')}</p>)}
          {this.renderStaticFormGroup('Build', <p className="form-control-static">{parameters.get('build')}</p>)}
          {this.renderStaticFormGroup('Actor Input', actorInput)}
        </span>
      );
    }

    return (
      <div className="form-horizontal">
        {resultForm}
        <div className="text-right">
          <button className="btn btn-link" onClick={this.showSetupModal}>
            <span className="kbc-icon-pencil"/>
            {' '}
            Edit Configuration
          </button>
        </div>
        {this.renderStaticFormGroup('Results table', resultsTable)}
      </div>
    );
  },

  renderCrawlerStatic(parameters) {
    const cname = parameters.get('customId', parameters.get('crawlerId'));
    return (
      <p className="form-control-static">
        {parameters.get('settingsLink')
          ? <ExternalLink href={parameters.get('settingsLink')}>{cname}</ExternalLink>
          : <span> {cname} </span>
        }
      </p>
    );
  },

  renderActorStatic(parameters) {
    const actId = parameters.get('actId');
    const url = `https://my.apify.com/acts/${actId}`;
    return (
      <p className="form-control-static">
        <ExternalLink href={url}>{actId}</ExternalLink>
      </p>
    );
  },


  renderStaticFormGroup(controlLabel, control, helpText) {
    return (
      <div className={'form-group'}>
        <label className="col-xs-3 control-label">
          {controlLabel}
        </label>
        <div className="col-xs-9">
          {control}
          <span className="help-block">
            {helpText}
          </span>
        </div>
      </div>
    );
  },

  renderStaticJsonEditor(data) {
    let value = '{}';
    if (data) {
      value = JSON.stringify(data, null, '  ');
    }
    return (
      <div className="form-control-static">
        <CodeMirror
          value={value}
          options={{
            theme: 'solarized',
            mode: 'application/json',
            lineNumbers: false,
            readOnly: true,
            lineWrapping: true,
            cursorHeight: 0,
          }}
        />
      </div>
    );
  },

  invalidToRun() {
    return this.isConfigured() ? '' : 'No crawler configured';
  },

  runParams() {
    return () => ({config: this.state.configId});
  },

  updateLocalState(path, data) {
    this.state.actions.updateLocalState(path, data);
  }

});
