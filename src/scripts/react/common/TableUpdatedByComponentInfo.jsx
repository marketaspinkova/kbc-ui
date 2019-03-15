import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import { Loader } from '@keboola/indigo-ui';
import createStoreMixin from '../mixins/createStoreMixin';
import InstalledComponentsStore from '../../modules/components/stores/InstalledComponentsStore';
import ComponentsStore from '../../modules/components/stores/ComponentsStore';
import InstalledComponentsActions from '../../modules/components/InstalledComponentsActionCreators';
import ComponentConfigurationLink from '../../modules/components/react/components/ComponentConfigurationLink';
import date from '../../utils/date';
import ComponentIcon from './ComponentIcon';
import ComponentName from './ComponentName';

export default React.createClass({
  mixins: [createStoreMixin(InstalledComponentsStore, ComponentsStore)],

  propTypes: {
    table: PropTypes.object.isRequired
  },

  getStateFromStores() {
    const { componentId, configId } = this.getLastUpdatedInfo();

    return {
      componentId,
      configId,
      component: ComponentsStore.getComponent(componentId),
      config: InstalledComponentsStore.getConfig(componentId, configId),
      isConfigsLoading: InstalledComponentsStore.getIsLoading(),
      isConfigsLoaded: InstalledComponentsStore.getIsLoaded()
    };
  },

  componentDidMount() {
    if (!this.state.isConfigsLoading && !this.state.isConfigsLoaded) {
      InstalledComponentsActions.loadComponentsForce();
    }
  },

  render() {
    if (!this.state.component) {
      return <span>N/A</span>;
    }

    if (this.state.isConfigsLoading) {
      return <Loader />;
    }

    if (!this.state.config.count()) {
      return (
        <span>
          <ComponentIcon component={this.state.component} resizeToSize="16" />
          <ComponentName component={this.state.component} /> / {this.state.configId}
        </span>
      );
    }

    return (
      <span>
        <ComponentIcon component={this.state.component} resizeToSize="16" />
        <ComponentConfigurationLink componentId={this.state.componentId} configId={this.state.configId}>
          <ComponentName component={this.state.component} /> / {this.state.config.get('name', this.state.configId)}
        </ComponentConfigurationLink>
      </span>
    );
  },

  renderTimefromNow(value) {
    if (value === null) {
      return 'N/A';
    }

    return (
      <div>
        {date.format(value)} <small>{moment(value).fromNow()}</small>
      </div>
    );
  },

  getLastUpdatedInfo() {
    let componentFound = this.metadataLookup('KBC.lastUpdatedBy.component.id');
    let configFound = this.metadataLookup('KBC.lastUpdatedBy.configuration.id');

    if (!componentFound || !configFound) {
      componentFound = this.metadataLookup('KBC.createdBy.component.id');
      configFound = this.metadataLookup('KBC.createdBy.configuration.id');
    }

    return { 
      componentId: componentFound && componentFound.get('value'), 
      configId: configFound && configFound.get('value')
    };
  },

  metadataLookup(key) {
    return this.props.table.get('metadata').find((m) => m.get('key') === key);
  }
});
