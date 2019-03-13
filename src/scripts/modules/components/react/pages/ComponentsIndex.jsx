import PropTypes from 'prop-types';
import React from 'react';
import { Map } from 'immutable';

import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import ApplicationStore from '../../../../stores/ApplicationStore';
import InstalledComponentsStore from '../../stores/InstalledComponentsStore';
import ComponentsStore from '../../stores/ComponentsStore';
import InstalledComponentsActionCreators from '../../InstalledComponentsActionCreators';
import {SearchBar} from '@keboola/indigo-ui';
import ComponentRow from './ComponentRow';
import NewComponentSelection from '../components/NewComponentSelection';
import { lookerPreviewHideComponents } from '../../../../constants/KbcConstants';

const TEXTS = {
  noComponents: {
    extractor: 'Extractors allow you to collect data from various sources.',
    writer: 'Writers allow you to send data to various destinations.',
    application: 'Use applications to enhance, modify or better understand your data.'
  },
  installFirst: {
    extractor: 'Get started with your first extractor!',
    writer: 'Get started with your first writer!',
    application: 'Get started with your first application!'
  }
};

export default React.createClass({
  mixins: [createStoreMixin(InstalledComponentsStore, ComponentsStore)],
  propTypes: {
    type: PropTypes.string.isRequired
  },
  getStateFromStores() {
    const components = ComponentsStore.getFilteredForType(this.props.type)
      .filter((component) => {
        if (component.get('flags').includes('excludeFromNewList')) {
          return false;
        }

        if (ApplicationStore.hasLookerPreview() && lookerPreviewHideComponents.includes(component.get('id'))) {
          return false;
        }

        return true;
      });

    return {
      installedComponentsFiltered: InstalledComponentsStore.getFilteredComponents(this.props.type),
      installedComponents: InstalledComponentsStore.getAllForType(this.props.type),
      deletingConfigurations: InstalledComponentsStore.getDeletingConfigurations(),
      components: components,
      componentFilter: ComponentsStore.getComponentFilter(this.props.type),
      configurationFilter: InstalledComponentsStore.getConfigurationFilter(this.props.type)
    };
  },

  render() {
    if (this.state.installedComponents.count()) {
      return (
        <div className="container-fluid">
          <div className="kbc-main-content kbc-components-list">
            <div className="row-searchbar">
              <SearchBar
                onChange={this.handleFilterChange}
                query={this.state.configurationFilter}
              />
            </div>
            {this.state.installedComponentsFiltered.count()
              ? this.state.installedComponentsFiltered.map((component) => {
                return (
                  <ComponentRow
                    component={component}
                    deletingConfigurations={this.state.deletingConfigurations.get(component.get('id'), Map())}
                    key={component.get('id')}
                  />
                );
              }).toArray()
              : (
                <div className="kbc-header">
                  <div className="kbc-title">
                    <h2>No {this.props.type}s found.</h2>
                  </div>
                </div>
              )
            }
          </div>
        </div>
      );
    }

    return (
      <div className="container-fluid">
        <NewComponentSelection
          className="kbc-main-content"
          components={this.state.components}
          filter={this.state.componentFilter}
          componentType={this.props.type}
        >
          <div className="row">
            <h2>{TEXTS.noComponents[this.props.type]}</h2>
            <p>{TEXTS.installFirst[this.props.type]}</p>
          </div>
        </NewComponentSelection>
      </div>
    );
  },

  handleFilterChange: function(query) {
    return InstalledComponentsActionCreators
      .setInstalledComponentsConfigurationFilter(this.props.type, query);
  }
});
