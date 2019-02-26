import React from 'react';

// stores
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import storeProvisioning, {storeMixins} from '../../storeProvisioning';
import RoutesStore from '../../../../stores/RoutesStore';
import {GapiStore} from '../../../google-utils/react/GapiFlux';

// actions
import actionsProvisioning from '../../actionsProvisioning';
import {GapiActions} from '../../../google-utils/react/GapiFlux';

// ui components
import QueryEditor from '../components/QueryEditor/QueryEditor';
import QueryNav from './QueryNav';
import McfEditor from '../components/QueryEditor/McfEditor';
import {Tab, Tabs} from 'react-bootstrap';

export default function(componentId) {
  return React.createClass({

    mixins: [createStoreMixin(...storeMixins, GapiStore)],

    getStateFromStores() {
      const configId = RoutesStore.getCurrentRouteParam('config');
      const queryId = RoutesStore.getCurrentRouteParam('queryId');
      const store = storeProvisioning(configId, componentId);
      const actions = actionsProvisioning(configId, componentId);
      const query = store.getConfigQuery(queryId);
      const editingQuery = store.getEditingQuery(queryId);
      const isLoadingMetadata = GapiStore.isLoadingMetadata();
      const metadata = GapiStore.getMetadata();

      return {
        isLoadingMetadata: isLoadingMetadata,
        metadata: metadata,
        query: query,
        queryId: queryId,
        editingQuery: editingQuery,
        store: store,
        actions: actions,
        configId: configId,
        localState: store.getLocalState()
      };
    },

    componentWillReceiveProps() {
      this.setState(this.getStateFromStores());
    },

    componentDidMount() {
      GapiActions.loadAnalyticsMetadata();
      this.state.actions.loadAccountSegments();
    },

    render() {
      const isEditing = !!this.state.editingQuery;
      const editorTabs =
        <Tabs
          defaultActiveKey={this.state.query.get('endpoint', 'reports')}
          id="ga-tabs"
          onSelect={this.onSelectTabFn(isEditing)}
        >
          <Tab eventKey={'reports'} title="Report">
            <div className="kbc-container">
            {this.renderQueryEditor(isEditing)}
            </div>
          </Tab>
          <Tab eventKey={'mcf'} title="Multi-Channel Funnel (Beta)">
            {this.renderMcfEditor(isEditing)}
          </Tab>
        </Tabs>;

      return (
        <div className="container-fluid">
          <div className="kbc-main-content">
            {isEditing ? null :
              <div className="col-md-3 kbc-main-nav">
                <div className="kbc-container">
                  <QueryNav
                    configurationId={this.state.configId}
                    queries={this.state.store.queriesFiltered}
                    filter={this.state.store.filter}
                    setQueriesFilter={this.state.actions.setQueriesFilter}
                    componentId={componentId}
                  />

                </div>
              </div>
            }
            {isEditing ?
              editorTabs :
              <div className="col-md-9 kbc-main-content-with-nav">
                {editorTabs}
              </div>
            }
          </div>
        </div>

      );
    },

    renderQueryEditor(isEditing) {
      return (
        <QueryEditor
          isEditing={isEditing}
          isLoadingMetadata={this.state.isLoadingMetadata}
          accountSegments={this.state.store.accountSegments}
          metadata={this.state.metadata}
          allProfiles={this.state.store.profiles}
          outputBucket={this.state.store.outputBucket}
          onChangeQuery={this.state.actions.onChangeEditingQueryFn(this.state.queryId)}
          onRunQuery={(query) => this.state.actions.runQuerySample(query, this.state.queryId)}
          sampleDataInfo={this.state.store.getSampleDataInfo(this.state.queryId)}
          isQueryValidFn={this.state.store.isQueryValid}
          query={isEditing ? this.state.editingQuery : this.state.query}
          {...this.state.actions.prepareLocalState('QueryDetail')}/>
      );
    },

    renderMcfEditor(isEditing) {
      return (
        <McfEditor
          isEditing={isEditing}
          isLoadingMetadata={this.state.isLoadingMetadata}
          metadata={this.state.metadata}
          allProfiles={this.state.store.profiles}
          outputBucket={this.state.store.outputBucket}
          onChangeQuery={this.state.actions.onChangeEditingQueryFn(this.state.queryId)}
          onRunQuery={(query) => this.state.actions.runQuerySample(query, this.state.queryId)}
          sampleDataInfo={this.state.store.getSampleDataInfo(this.state.queryId)}
          isQueryValidFn={this.state.store.isQueryValid}
          query={isEditing ? this.state.editingQuery : this.state.query}
          {...this.state.actions.prepareLocalState('QueryDetail')}/>
      );
    },

    onSelectTabFn(isEditing) {
      return (key) => {
        const query = isEditing ? this.state.editingQuery : this.state.query;
        const newQuery = query.setIn([].concat('endpoint'), key);
        this.state.actions.onUpdateNewQuery(newQuery);
      };
    }
  });
}
