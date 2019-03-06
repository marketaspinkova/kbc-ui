import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import fuzzy from 'fuzzy';
import { Map } from 'immutable';
import { Button, Table } from 'react-bootstrap';
import { SearchBar } from '@keboola/indigo-ui';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import VersionsStore from '../../stores/VersionsStore';
import ComponentsStore from '../../stores/ComponentsStore';
import RoutesStore from '../../../../stores/RoutesStore';
import { getPreviousVersion } from '../../../../utils/VersionsDiffUtils';
import createVersionOnRollback from '../../../../utils/createVersionOnRollback';
import createVersionOnCopy from '../../../../utils/createVersionOnCopy';
import simpleMatch from '../../../../utils/simpleMatch';
import VersionsActionCreators from '../../VersionsActionCreators';
import VersionRow from '../components/VersionRow';

const ITEMS_PER_PAGE = 20;

export default function(componentIdValue, configIdParam = 'config', readOnlyMode = false) {
  return React.createClass({
    mixins: [createStoreMixin(VersionsStore), PureRenderMixin],

    getStateFromStores() {
      const configId = RoutesStore.getCurrentRouteParam(configIdParam);
      const componentId = RoutesStore.getCurrentRouteParam('component') || componentIdValue;
      const component = ComponentsStore.getComponent(componentId);
      let versions = VersionsStore.getVersions(componentId, configId);
      let query = VersionsStore.getSearchFilter(componentId, configId);
      let filteredVersions = versions;

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
        versions: versions,
        versionsConfigs: VersionsStore.getVersionsConfigs(componentId, configId),
        filteredVersions: filteredVersions,
        newVersionNames: VersionsStore.getNewVersionNames(componentId, configId),
        query: VersionsStore.getSearchFilter(componentId, configId),
        isPending: VersionsStore.isPendingConfig(componentId, configId),
        pendingActions: VersionsStore.getPendingVersions(componentId, configId),
        pendingMultiLoad: VersionsStore.getPendingMultiLoad(componentId, configId),
        deprecated: component.get('flags').includes('deprecated')
      };
    },

    getInitialState() {
      return {
        page: 1
      };
    },

    render() {
      return (
        <div className="container-fluid">
          <div className="kbc-main-content">
            <div className="row-searchbar">
              <SearchBar onChange={this.onSearchChange} query={this.state.query}/>
            </div>
            {this.renderTable()}
          </div>
        </div>
      );
    },

    renderTable() {
      if (this.state.filteredVersions.count() === 0 && this.state.versions.count() > 0) {
        return <p className="kbc-inner-padding text-center">No results found.</p>;
      }

      return (
        <div>
          <Table responsive striped hover>
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
          {this.renderMoreButton()}
        </div>
      );
    },

    renderVersionRows() {
      return this.getPaginatedVersions().map(this.renderVersionRow).toArray();
    },

    renderVersionRow(version, key) {
      const previousVersion = getPreviousVersion(this.state.versions, version);
      const previousVersionConfig = getPreviousVersion(this.state.versionsConfigs, version) || Map();
      const isMultiPending = this.state.pendingMultiLoad.get(version.get('version'), false);
      const currentVersionConfig = this.state.versionsConfigs.filter((currentVersion) => {
        return version.get('version') === currentVersion.get('version');
      }).first() || Map();

      return (
        <VersionRow
          key={version.get('version')}
          version={version}
          versionConfig={currentVersionConfig}
          componentId={this.state.componentId}
          configId={this.state.configId}
          newVersionName={this.state.newVersionNames.get(version.get('version'))}
          isCopyPending={this.state.pendingActions.getIn([version.get('version'), 'copy'], false)}
          isCopyDisabled={readOnlyMode || this.state.isPending}
          isRollbackPending={this.state.pendingActions.getIn([version.get('version'), 'rollback'], false)}
          isRollbackDisabled={readOnlyMode || this.state.isPending}
          hideRollback={readOnlyMode || (key === 0)}
          hideCopy={readOnlyMode || this.state.deprecated}
          isDiffPending={isMultiPending}
          isDiffDisabled={this.state.isPending || isMultiPending}
          previousVersion={previousVersion}
          previousVersionConfig={previousVersionConfig}
          onPrepareVersionsDiffData={() => this.prepareVersionsDiffData(version, previousVersion)}
          isLast={this.state.versions.first().get('version') === version.get('version')}
          onChangeName={(name) => VersionsActionCreators.changeNewVersionName(this.state.componentId, this.state.configId, version.get('version'), name)}
          onCopy={createVersionOnCopy(this.state.componentId, this.state.configId, version, this.state.newVersionNames.get(version.get('version')))}
          onRollback={createVersionOnRollback(this.state.componentId, this.state.configId, version)}
        />
      );
    },

    renderMoreButton() {
      if (this.state.filteredVersions.count() <= this.state.page * ITEMS_PER_PAGE) {
        return null;
      }

      return (
        <div className="kbc-block-with-padding">
          <Button bsSize="large" onClick={this.onShowMore} className="text-center">
            More...
          </Button>
        </div>
      );
    },

    prepareVersionsDiffData(version1, version2) {
      return VersionsActionCreators.loadTwoComponentConfigVersions(
        this.state.componentId, this.state.configId, version1.get('version'), version2.get('version')
      );
    },

    onSearchChange(query) {
      VersionsActionCreators.changeFilter(this.state.componentId, this.state.configId, query);
    },

    onShowMore() {
      const nextPage = this.state.page + 1;
      this.setState({page: nextPage});
    },

    getPaginatedVersions() {
      return this.state.filteredVersions.slice(0, ITEMS_PER_PAGE * this.state.page);
    }
  });
}
