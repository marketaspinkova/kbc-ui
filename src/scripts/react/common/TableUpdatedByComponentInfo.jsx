import React, {PropTypes} from 'react';
import {fromJS} from 'immutable';
import createStoreMixin from '../mixins/createStoreMixin';
import {Loader, NotAvailable} from '@keboola/indigo-ui';

import date from '../../utils/date';
import moment from 'moment';

import ComponentsStore from '../../modules/components/stores/ComponentsStore';
import ComponentIcon from './ComponentIcon';
import ComponentName from './ComponentName';
import ComponentConfigurationLink from '../../modules/components/react/components/ComponentConfigurationLink';
import InstalledComponentsStore from '../../modules/components/stores/InstalledComponentsStore';
import InstalledComponentsActions from '../../modules/components/InstalledComponentsActionCreators';

export default React.createClass({
  mixins: [createStoreMixin(InstalledComponentsStore, ComponentsStore)],

  propTypes: {
    table: PropTypes.object.isRequired
  },

  getStateFromStores() {
    return {
      isConfigsLoading: InstalledComponentsStore.getIsLoading(),
      isConfigsLoaded: InstalledComponentsStore.getIsLoaded()
    };
  },

  componentDidMount() {
    if (!!this.state.isConfigsLoading && this.state.isConfigsLoaded) {
      InstalledComponentsActions.loadComponentsForce();
    }
  },

  render() {
    const {componentId, configId/* , timestamp*/} = this.getLastUpdatedInfo();
    const component = componentId && ComponentsStore.getComponent(componentId);

    if (!component) {
      return <NotAvailable/>;
    }

    if (this.state.isConfigsLoading) {
      return <Loader />;
    }

    const config = InstalledComponentsStore.getConfig(componentId, configId);
    const unknownConfigName = `Unknown configuration (${configId})`;
    const configName = config ? config.get('name', unknownConfigName) : unknownConfigName;

    return (
      <span>
        <ComponentIcon component={fromJS(component)} resizeToSize="16" />
        <ComponentConfigurationLink componentId={componentId} configId={configId}>
          <ComponentName component={component} /> / {configName}
        </ComponentConfigurationLink>
      </span>
    );
  },

  renderTimefromNow(value) {
    if (value === null) {
      return <NotAvailable/>;
    }
    const fromNow = moment(value).fromNow();
    return (
      <div> {date.format(value)}
        <small> {fromNow} </small>
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
    const componentId = componentFound && componentFound.get('value');
    const configId = configFound && configFound.get('value');
    const timestamp = configFound && configFound.get('timestamp');
    return {componentId, configId, timestamp};
  },

  metadataLookup(key) {
    const metadata = this.props.table.get('metadata');
    return metadata.find(m => m.get('key') === key);
  }

});
