import React from 'react';
import createReactClass from 'create-react-class';
import { Map } from 'immutable';

import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import OrchestrationsActionCreators from '../../../ActionCreators';
import OrchestrationStore from '../../../stores/OrchestrationsStore';

import OrchestrationRow from './OrchestrationRow';
import { SearchBar } from '@keboola/indigo-ui';
import ImmutableRendererMixin from 'react-immutable-render-mixin';
import NewOrchestrationButton from '../../components/NewOrchestionButton';

const SORT_OPTIONS = {
  ASC: 'asc',
  DESC: 'desc'
};

export default createReactClass({
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

  getInitialState() {
    return {
      sortByName: null
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
            {this.state.orchestrations.count() ? this.renderTable() : this.renderNotFound()}
          </div>
        </div>
      );
    }

    return (
      <div className="container-fluid">
        <div className="kbc-main-content">{this.renderEmptyState()}</div>
      </div>
    );
  },

  renderEmptyState() {
    return (
      <div className="row">
        <h2>
          Orchestrations allow you to group together related tasks and schedule their execution.
        </h2>
        <div>
          <NewOrchestrationButton />
        </div>
      </div>
    );
  },

  renderNotFound() {
    return (
      <div className="kbc-header">
        <div className="kbc-title">
          <h2>No orchestrations found.</h2>
        </div>
      </div>
    );
  },

  renderTable() {
    return (
      <div className="table table-striped table-hover">
        {this.renderTableHeader()}
        <div className="tbody">{this.renderTableBody()}</div>
      </div>
    );
  },

  renderTableHeader() {
    return (
      <div className="thead" key="table-header">
        <div className="tr">
          <span className="th" style={{ width: '50px' }} />
          <span className="th">
            <strong 
              className="kbc-cursor-pointer"
              title="Sort by name"
              onClick={() => this.sortByName()}
            >
              Name {this.sortByNameLabel()}
            </strong>
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
  },

  renderTableBody() {
    let orchestrations = this.state.orchestrations;

    if (this.state.sortByName) {
      orchestrations = orchestrations.sortBy((orchestration) => orchestration.get('name').toLowerCase());

      if (this.state.sortByName === SORT_OPTIONS.DESC) {
        orchestrations = orchestrations.reverse();
      }
    }

    return orchestrations
      .map((orchestration) => {
        const tasks = this.state.allTasksToRun.get(orchestration.get('id'))
          ? this.state.allTasksToRun.get(orchestration.get('id'))
          : this.state.allTasks.get(orchestration.get('id'));

        return (
          <OrchestrationRow
            orchestration={orchestration}
            pendingActions={this.state.pendingActions.get(orchestration.get('id'), Map())}
            key={orchestration.get('id')}
            tasks={tasks}
          />
        );
      })
      .toArray();
  },

  sortByName() {
    let sortByName = null;

    if (!this.state.sortByName) {
      sortByName = SORT_OPTIONS.ASC;
    } else if (this.state.sortByName === SORT_OPTIONS.ASC) {
      sortByName = SORT_OPTIONS.DESC;
    }

    this.setState({ sortByName });
  },

  sortByNameLabel() {
    if (this.state.sortByName === SORT_OPTIONS.DESC) {
      return <i className="fa fa-sort-desc" />;
    }

    if (this.state.sortByName === SORT_OPTIONS.ASC) {
      return <i className="fa fa-sort-asc" />;
    }

    return <i className="fa fa-sort" />;
  }
});
