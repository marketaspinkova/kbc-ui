import React from 'react';
import createReactClass from 'create-react-class';
import moment from 'moment';
import { Map } from 'immutable';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import ComponentsStore from '../../../components/stores/ComponentsStore';
import InstalledComponentsStore from '../../../components/stores/InstalledComponentsStore';
import InstaledComponentsActions from '../../../components/InstalledComponentsActionCreators';
import Select from 'react-select';
import SplashIcon from '../../../../react/common/SplashIcon';
import { SearchBar } from '@keboola/indigo-ui';
import DeletedComponentRow from '../components/DeletedComponentRow';
import TrashHeaderButtons from '../components/TrashHeaderButtons';
import SettingsTabs from '../../../../react/layout/SettingsTabs';

const typeFilterOptions = [
  {
    label: 'Extractors',
    value: 'extractor'
  },
  {
    label: 'Transformations',
    value: 'transformation'
  },
  {
    label: 'Writers',
    value: 'writer'
  },
  {
    label: 'Orchestrations',
    value: 'orchestrator'
  },
  {
    label: 'Applications',
    value: 'application'
  }
];

export default createReactClass({
  mixins: [createStoreMixin(InstalledComponentsStore, ComponentsStore)],

  getStateFromStores() {
    return {
      filterName: InstalledComponentsStore.getTrashFilter('name'),
      filterType: InstalledComponentsStore.getTrashFilter('type'),
      installedFilteredComponents: InstalledComponentsStore.getAllDeletedFiltered(),
      deletingConfigurations: InstalledComponentsStore.getDeletingConfigurations(),
      restoringConfigurations: InstalledComponentsStore.getRestoringConfigurations(),
      components: ComponentsStore.getAll()
    };
  },

  handleFilterChange(query, filterType) {
    InstaledComponentsActions.deletedConfigurationsFilterChange(query, filterType);
  },

  renderRows() {
    let components = this.state.installedFilteredComponents;

    if (!components.count()) {
      return <SplashIcon icon="kbc-icon-cup" label={this.splashLabel()} />;
    }

    return components
      .map(component => (
        <DeletedComponentRow
          component={component}
          configurations={this.sortedConfigurations(component)}
          deletingConfigurations={this.state.deletingConfigurations.get(component.get('id'), Map())}
          restoringConfigurations={this.state.restoringConfigurations.get(component.get('id'), Map())}
          key={component.get('id')}
        />
      ))
      .toArray();
  },

  sortedConfigurations(component) {
    let configurations = InstalledComponentsStore.getAllDeletedConfigurationsFiltered(component);

    if (configurations.count() < 1) {
      configurations = component.get('configurations');
    }

    return configurations.sortBy((configuration) => {
      return -moment(configuration.getIn(['currentVersion', 'created'])).unix();
    });
  },

  splashLabel() {
    if (this.state.filterName || this.state.filterType) {
      return 'No removed configurations found';
    }

    return 'Trash is empty';
  },

  render() {
    const additionalActions = [
      <Select
        value={this.state.filterType}
        onChange={selected => {
          const query = selected !== null ? selected.value : '';
          this.handleFilterChange(query, 'type');
        }}
        options={typeFilterOptions}
        placeholder="All components"
        className="settings-trash-select"
        key="searchbar-component-filter"
      />,
      <TrashHeaderButtons key="searchbar-trash-header-buttons" />
    ];

    return (
      <div className="container-fluid">
        <div className="kbc-main-content kbc-components-list">
          <SettingsTabs active="settings-trash" />
          <div className="tab-content ">
            <div className="row-searchbar row-searchbar-no-padding">
              <SearchBar
                query={this.state.filterName}
                onChange={query => this.handleFilterChange(query, 'name')}
                additionalActions={additionalActions}
              />
            </div>
            <div className="tab-pane tab-pane-no-padding active">{this.renderRows()}</div>
          </div>
        </div>
      </div>
    );
  }
});
