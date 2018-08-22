import React from 'react';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import VersionsStore from '../../../configurations/RowVersionsStore';
import VersionRow from '../../../components/react/components/VersionRow';
import RoutesStore from '../../../../stores/RoutesStore';
import { getPreviousVersion } from '../../../../utils/VersionsDiffUtils';
import { Table } from 'react-bootstrap';
import SearchRow from '../../../../react/common/SearchRow';
import VersionsActionCreators from '../../../configurations/RowVersionsActionCreators';
import fuzzy from 'fuzzy';
import immutableMixin from 'react-immutable-render-mixin';
import { Map } from 'immutable';
import createRowVersionOnRollback from '../../../configurations/utils/createRowVersionOnRollback';
import { simpleMatch } from '../../../../utils/utils';

const ITEMS_PER_PAGE = 20;

export default React.createClass({
  mixins: [createStoreMixin(VersionsStore), immutableMixin],

  getStateFromStores() {
    var versions, filteredVersions, query;
    const componentId = 'transformation';
    const configId = RoutesStore.getCurrentRouteParam('config');
    const rowId = RoutesStore.getCurrentRouteParam('row');
    versions = VersionsStore.getVersions(componentId, configId, rowId);
    query = VersionsStore.getSearchFilter(componentId, configId, rowId);
    filteredVersions = versions;
    if (query && query !== '') {
      filteredVersions = versions.filter(function(version) {
        return (
          simpleMatch(query, (String(version.get('version')) || '')) ||
          fuzzy.test(query, (version.get('changeDescription') || '')) ||
          simpleMatch(query, (version.getIn(['creatorToken', 'description']) || '')) ||
          simpleMatch(query, (String(version.get('created')) || ''))
        );
      });
    }
    return {
      componentId: componentId,
      configId: configId,
      rowId: rowId,
      versions: versions,
      versionsConfigs: VersionsStore.getVersionsConfigs(componentId, configId, rowId),
      filteredVersions: filteredVersions,
      newVersionNames: VersionsStore.getNewVersionNames(componentId, configId, rowId),
      query: VersionsStore.getSearchFilter(componentId, configId, rowId),
      isPending: VersionsStore.isPendingConfig(componentId, configId, rowId),
      pendingActions: VersionsStore.getPendingVersions(componentId, configId, rowId),
      pendingMultiLoad: VersionsStore.getPendingMultiLoad(componentId, configId, rowId)
    };
  },

  getInitialState() {
    return {
      page: 1
    };
  },

  getPaginatedVersions() {
    return this.state.filteredVersions.slice(0, ITEMS_PER_PAGE * this.state.page);
  },

  renderVersionRows() {
    const allVersions = this.state.versions;
    return this.getPaginatedVersions().map(function(version, i) {
      const previousVersion = getPreviousVersion(this.state.versions, version);
      const previousVersionConfig = getPreviousVersion(this.state.versionsConfigs, version) || Map();
      const currentVersionConfig = this.state.versionsConfigs.filter((currentVersion) => {
        return version.get('version') === currentVersion.get('version');
      }).first() || Map();
      const isMultiPending = this.state.pendingMultiLoad.get(version.get('version'), false);
      return (
        <VersionRow
          key={version.get('version')}
          version={version}
          versionConfig={currentVersionConfig}
          componentId={this.state.componentId}
          configId={this.state.configId}
          rowId={this.state.rowId}
          newVersionName={this.state.newVersionNames.get(version.get('version'))}
          isCopyPending={this.state.pendingActions.getIn([version.get('version'), 'copy'], false)}
          isCopyDisabled={this.state.isPending}
          isRollbackPending={this.state.pendingActions.getIn([version.get('version'), 'rollback'], false)}
          isRollbackDisabled={this.state.isPending}
          hideRollback={(i === 0)}
          isDiffPending={isMultiPending}
          isDiffDisabled={this.state.isPending || isMultiPending}
          previousVersion={previousVersion}
          previousVersionConfig={previousVersionConfig}
          onPrepareVersionsDiffData= {() => this.prepareVersionsDiffData(version, previousVersion)}
          isLast={allVersions.first().get('version') === version.get('version')}
          onRollback={createRowVersionOnRollback(this.state.componentId, this.state.configId, this.state.rowId, version.get('version'))}
          hideCopy={true}
        />
      );
    }, this).toArray();
  },


  prepareVersionsDiffData(version1, version2) {
    return VersionsActionCreators.loadTwoComponentConfigVersions(
      this.state.componentId, this.state.configId, this.state.rowId, version1.get('version'), version2.get('version'));
  },

  onSearchChange(query) {
    VersionsActionCreators.changeFilter(this.state.componentId, this.state.configId, this.state.rowId, query);
  },

  onShowMore() {
    const nextPage = this.state.page + 1;
    this.setState({page: nextPage});
  },

  render() {
    if (this.state.filteredVersions.count() === 0 && this.state.versions.count() > 0) {
      return (
        <div className="container-fluid">
          <div className="kbc-main-content">
            <SearchRow className="row kbc-search-row" onChange={this.onSearchChange} query={this.state.query}/>
            <p className="row text-center">No results found.</p>
          </div>
        </div>
      );
    }
    return (
      <div className="container-fluid">
        <div className="kbc-main-content">
          <SearchRow className="row kbc-search-row" onChange={this.onSearchChange} query={this.state.query}/>
          <Table striped hover>
            <thead>
            <tr>
              <th>#</th>
              <th />
              <th>Description</th>
              <th>Changed</th>
              <th>Created by</th>
              <th />
            </tr>
            </thead>
            <tbody>
            {this.renderVersionRows()}
            </tbody>
          </Table>
          {this.state.filteredVersions.count() > this.state.page * ITEMS_PER_PAGE ?
            <div className="kbc-block-with-padding">
              <button onClick={this.onShowMore} className="btn btn-default btn-large text-center">
                More..
              </button>
            </div>
            : null
          }
        </div>
      </div>
    );
  }
});
