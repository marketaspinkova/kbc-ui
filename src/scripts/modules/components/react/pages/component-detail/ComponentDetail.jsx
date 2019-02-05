import React from 'react';
import { Map } from 'immutable';
import { SearchBar } from '@keboola/indigo-ui';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import RoutesStore from '../../../../../stores/RoutesStore';
import ComponentsStore from '../../../stores/ComponentsStore';
import InstalledComponentsStore from '../../../stores/InstalledComponentsStore';
import InstalledComponentsActionCreators from '../../../InstalledComponentsActionCreators';
import VendorInfo from './VendorInfo';
import ConfigurationRow from '../ConfigurationRow';
import ComponentEmptyState from '../../components/ComponentEmptyState';
import AddComponentConfigurationButton from '../../components/AddComponentConfigurationButton';
import FormHeader from '../new-component-form/FormHeader';
import AppUsageInfo from '../new-component-form/AppUsageInfo';
import ComponentDescription from './ComponentDescription';
import contactSupport from '../../../../../utils/contactSupport';
import MigrationRow from '../../components/MigrationRow';

export default React.createClass({
  mixins: [createStoreMixin(ComponentsStore, InstalledComponentsStore)],

  propTypes: {
    component: React.PropTypes.string
  },

  getStateFromStores() {
    let configurations = Map();
    let deletingConfigurations = Map();
    const componentId = this.props.component ? this.props.component : RoutesStore.getCurrentRouteParam('component');
    const component = ComponentsStore.getComponent(componentId);
    const componentWithConfigurations = InstalledComponentsStore.getComponent(component.get('id'));

    if (InstalledComponentsStore.getDeletingConfigurations()) {
      deletingConfigurations = InstalledComponentsStore.getDeletingConfigurations();
    }

    if (componentWithConfigurations) {
      configurations = componentWithConfigurations.get('configurations', Map());
    }

    return {
      component,
      configurations,
      deletingConfigurations: deletingConfigurations.get(component.get('id'), Map()),
      configurationFilter: InstalledComponentsStore.getComponentDetailFilter(component.get('id'))
    };
  },

  render() {
    return (
      <div className="container-fluid">
        {this._isDeprecated() && (
          <MigrationRow
            componentId={this.state.component.get('id')}
            replacementAppId={this.state.component.getIn(['uiOptions', 'replacementApp'])}
          />
        )}
        <div className="kbc-main-content">
          <FormHeader component={this.state.component} withButtons={false} />
          <div className="row">
            <div className="col-md-6">
              <AppUsageInfo component={this.state.component} />
            </div>
            <div className="col-md-6">
              <VendorInfo component={this.state.component} />
            </div>
          </div>
          {this.state.component.get('longDescription') && (
            <div className="kbc-row">
              <ComponentDescription component={this.state.component} />
            </div>
          )}
          {this._renderSearchBar()}
          {this._renderConfigurations()}
        </div>
      </div>
    );
  },

  _getFilteredConfigurations() {
    let filtered = this.state.configurations;
    if (this.state.configurationFilter || this.state.configurationFilter !== '') {
      const filterQuery = this.state.configurationFilter.toLowerCase();
      filtered = this.state.configurations.filter(
        configuration =>
          configuration
            .get('name', '')
            .toLowerCase()
            .match(filterQuery) ||
          configuration.get('id', '').match(filterQuery) ||
          configuration
            .get('description', '')
            .toLowerCase()
            .match(filterQuery)
      );
    }
    return filtered.sortBy(configuration => configuration.get('name').toLowerCase());
  },

  _isDeprecated() {
    return this.state.component.get('flags').includes('deprecated');
  },

  _handleFilterChange(query) {
    InstalledComponentsActionCreators.setInstalledComponentsComponentDetailFilter(
      this.state.component.get('id'),
      query
    );
  },

  _renderSearchBar() {
    if (!this.state.configurations.count()) {
      return null;
    }

    const additionalActions = (
      <AddComponentConfigurationButton disabled={this._isDeprecated()} component={this.state.component} />
    );

    return (
      <div className="row-searchbar row-searchbar-no-border-bottom">
        <h2>Configurations</h2>
        <SearchBar
          onChange={this._handleFilterChange}
          query={this.state.configurationFilter}
          placeholder="Search by name, description or id"
          additionalActions={additionalActions}
        />
      </div>
    );
  },

  _renderConfigurations() {
    if (this.state.configurations.count()) {
      if (this._getFilteredConfigurations().count()) {
        return (
          <div className="table table-hover">
            <div className="tbody">
              {this._getFilteredConfigurations()
                .map(configuration => {
                  return (
                    <ConfigurationRow
                      component={this.state.component}
                      config={configuration}
                      componentId={this.state.component.get('id')}
                      isDeleting={this.state.deletingConfigurations.has(configuration.get('id'))}
                      key={configuration.get('id')}
                    />
                  );
                })
                .toArray()}
            </div>
          </div>
        );
      }

      return (
        <div className="kbc-header">
          <div className="kbc-title">
            <h2>No configurations found.</h2>
          </div>
        </div>
      );
    }

    return (
      <div className="row kbc-row">
        <ComponentEmptyState>
          <div className="text-center">
            <AddComponentConfigurationButton
              disabled={false}
              label="New Configuration"
              component={this.state.component}
            />
          </div>
        </ComponentEmptyState>
      </div>
    );
  },

  _openSupportModal(e) {
    contactSupport({ type: 'project' });
    e.preventDefault();
    return e.stopPropagation();
  }
});
