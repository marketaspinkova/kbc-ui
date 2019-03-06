import React from 'react';
import { Map } from 'immutable';

import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import OrchestrationsActionCreators from '../../../ActionCreators';
import OrchestrationStore from '../../../stores/OrchestrationsStore';

import OrchestrationRow from './OrchestrationRow';
import { SearchBar } from '@keboola/indigo-ui';
import ImmutableRendererMixin from 'react-addons-pure-render-mixin';
import NewOrchestrationButton from '../../components/NewOrchestionButton';

export default React.createClass({
  mixins: [createStoreMixin(OrchestrationStore), ImmutableRendererMixin],

  _handleFilterChange(query) {
    return OrchestrationsActionCreators.setOrchestrationsFilter(query);
  },

  getStateFromStores() {
    return {
      totalOrchestrationsCount: OrchestrationStore.getAll().count(),
      orchestrations: OrchestrationStore.getFiltered(),
      allTasks: OrchestrationStore.getAllOrchestrationsTasks(),
      allTasksToRun: OrchestrationStore.getAllOrchestrationsTasksToRun(),
      pendingActions: OrchestrationStore.getPendingActions(),
      isLoading: OrchestrationStore.getIsLoading(),
      isLoaded: OrchestrationStore.getIsLoaded(),
      filter: OrchestrationStore.getFilter()
    };
  },

  render() {
    if (this.state.totalOrchestrationsCount) {
      return (
        <div className="container-fluid">
          <div className="kbc-main-content">
            <div className="row-searchbar">
              <SearchBar onChange={this._handleFilterChange} query={this.state.filter} />
            </div>
            {this.state.orchestrations.count() ? this._renderTable() : this._renderNotFound()}
          </div>
        </div>
      );
    }

    return (
      <div className="container-fluid">
        <div className="kbc-main-content">{this._renderEmptyState()}</div>
      </div>
    );
  },

  _renderEmptyState() {
    return (
      <div className="row">
        <h2>Orchestrations allow you to group together related tasks and schedule their execution.</h2>
        <div>
          <NewOrchestrationButton />
        </div>
      </div>
    );
  },

  _renderNotFound() {
    return (
      <div className="kbc-header">
        <div className="kbc-title">
          <h2>No orchestrations found.</h2>
        </div>
      </div>
    );
  },

  _renderTable() {
    const childs = this.state.orchestrations
      .map(orchestration => {
        const orchestrationId = orchestration.get('id');
        return (
          <OrchestrationRow
            orchestration={orchestration}
            pendingActions={this.state.pendingActions.get(orchestration.get('id'), Map())}
            key={orchestration.get('id')}
            tasks={this.state.allTasksToRun.get(orchestrationId)
              ? this.state.allTasksToRun.get(orchestrationId)
              : this.state.allTasks.get(orchestrationId)}
          />
        );
      })
      .toArray();

    return (
      <div className="table table-striped table-hover">
        {this._renderTableHeader()}
        <div className="tbody">{childs}</div>
      </div>
    );
  },

  _renderTableHeader() {
    return (
      <div className="thead" key="table-header">
        <div className="tr">
          <span className="th" style={{width: '50px'}}/>
          <span className="th">
            <strong>Name</strong>
          </span>
          <span className="th">
            <strong>Last Run</strong>
          </span>
          <span className="th">
            <strong>Duration</strong>
          </span>
          <span className="th">
            <strong>Schedule</strong>
          </span>
          <span className="th" />
        </div>
      </div>
    );
  }
});
