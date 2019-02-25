import React from 'react';
import {Tab, Tabs} from 'react-bootstrap';

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
import McfEditor from '../components/QueryEditor/McfEditor';

export default function(componentId) {
  return React.createClass({

    mixins: [createStoreMixin(...storeMixins, GapiStore)],

    getStateFromStores() {
      const configId = RoutesStore.getCurrentRouteParam('config');
      const store = storeProvisioning(configId, componentId);
      const actions = actionsProvisioning(configId, componentId);
      const newQuery = store.getNewQuery();
      const isLoadingMetadata = GapiStore.isLoadingMetadata();
      const metadata = GapiStore.getMetadata();

      return {
        isLoadingMetadata: isLoadingMetadata,
        metadata: metadata,
        newQuery: newQuery,
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
      return (
        <div className="container-fluid">
          <div className="kbc-main-content">
            <Tabs defaultActiveKey={'report'} id="ga-tabs" onSelect={this.onSelectTab}>
              <Tab eventKey={'report'} title="Report">
                {this.renderQueryEditor()}
              </Tab>
              <Tab eventKey={'mcf'} title="Multi-Channel Funnel">
                {this.renderMcfEditor()}
              </Tab>
            </Tabs>
          </div>
        </div>
      );
    },

    renderQueryEditor() {
      return (
        <QueryEditor
          isEditing={true}
          isLoadingMetadata={this.state.isLoadingMetadata}
          accountSegments={this.state.store.accountSegments}
          metadata={this.state.metadata}
          allProfiles={this.state.store.profiles}
          outputBucket={this.state.store.outputBucket}
          onChangeQuery={this.state.actions.onUpdateNewQuery}
          onRunQuery={(query) => this.state.actions.runQuerySample(query, 'NewQuery')}
          sampleDataInfo={this.state.store.getSampleDataInfo('NewQuery')}
          isQueryValidFn={this.state.store.isQueryValid}
          query={this.state.newQuery}
          {...this.state.actions.prepareLocalState('NewQuery')}/>
      );
    },

    renderMcfEditor() {
      return (
        <McfEditor
          isEditing={true}
          isLoadingMetadata={this.state.isLoadingMetadata}
          metadata={this.state.metadata}
          allProfiles={this.state.store.profiles}
          outputBucket={this.state.store.outputBucket}
          onChangeQuery={this.state.actions.onUpdateNewQuery}
          onRunQuery={(query) => this.state.actions.runQuerySample(query, 'NewQuery')}
          sampleDataInfo={this.state.store.getSampleDataInfo('NewQuery')}
          isQueryValidFn={this.state.store.isQueryValid}
          query={this.state.newQuery}
          {...this.state.actions.prepareLocalState('NewQuery')}/>
      );
    },

    onSelectTab(key) {
      const newQuery = this.state.newQuery.setIn([].concat('endpoint'), key);
      this.state.actions.onUpdateNewQuery(newQuery);
    }
  });
}
