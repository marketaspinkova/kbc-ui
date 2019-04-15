import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Map } from 'immutable';
import { SearchBar } from '@keboola/indigo-ui';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import RoutesStore from '../../../../../stores/RoutesStore';
import ComponentsStore from '../../../stores/ComponentsStore';
import contactSupport from '../../../../../utils/contactSupport';
import matchByWords from '../../../../../utils/matchByWords';
import InstalledComponentsStore from '../../../stores/InstalledComponentsStore';
import InstalledComponentsActionCreators from '../../../InstalledComponentsActionCreators';
import AddComponentConfigurationButton from '../../components/AddComponentConfigurationButton';
import ComponentEmptyState from '../../components/ComponentEmptyState';
import MigrationRow from '../../components/MigrationRow';
import AppUsageInfo from '../new-component-form/AppUsageInfo';
import FormHeader from '../new-component-form/FormHeader';
import ConfigurationRow from '../ConfigurationRow';
import ComponentDescription from './ComponentDescription';
import VendorInfo from './VendorInfo';

export default createReactClass({
  mixins: [createStoreMixin(ComponentsStore, InstalledComponentsStore)],

  propTypes: {
    component: PropTypes.string
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
    if (this.state.configurationFilter) {
      const filterQuery = this.state.configurationFilter.toLowerCase();
      filtered = this.state.configurations.filter(configuration => {
        if (matchByWords(configuration.get('name', '').toLowerCase(), filterQuery)) {
          return true;
        }

        if (matchByWords(configuration.get('id', '').toLowerCase(), filterQuery)) {
          return true;
        }

        if (matchByWords(configuration.get('description', '').toLowerCase(), filterQuery)) {
          return true;
        }

        return false;
      });
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
    e.preventDefault();
    e.stopPropagation();
    contactSupport();
  }
});
