import React, {PropTypes} from 'react';
import {fromJS} from 'immutable';
import createStoreMixin from '../mixins/createStoreMixin';
import {Loader} from '@keboola/indigo-ui';

import ComponentsStore from '../../modules/components/stores/ComponentsStore';
import ComponentIcon from './ComponentIcon';
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
    const {componentId, configId} = this.getLastUpdatedInfo();
    const component = componentId && ComponentsStore.getComponent(componentId);

    if (!component) {
      return <span>N/A</span>;
    }

    if (this.state.isConfigsLoading) {
      return <Loader />;
    }

    const componentName = component.get('type') !== 'transformation' ? `${component.get('name')} ${component.get('type')}` : `${component.get('type')}`;
    const config = InstalledComponentsStore.getConfig(componentId, configId);
    const configName = config ? config.get('name', configId) : configId;

    return (
      <span>
        <ComponentIcon component={fromJS(component)}/>
        <ComponentConfigurationLink componentId={componentId} configId={configId}>{componentName} / {configName}
        </ComponentConfigurationLink>
      </span>
    );
  },

  getLastUpdatedInfo() {
    const metadata = this.props.table.get('metadata');
    const componentFound = metadata.find(m => m.get('key') === 'KBC.lastUpdatedBy.component.id');
    const configFound = metadata.find(m => m.get('key') === 'KBC.lastUpdatedBy.configuration.id');
    const componentId = componentFound && componentFound.get('value');
    const configId = configFound && configFound.get('value');
    return {componentId, configId};
  }

});