import React from 'react';

import createReactClass from 'create-react-class';

import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import RoutesStore from '../../../../stores/RoutesStore';
import ComponentStore from '../../stores/ComponentsStore';

import GenericDetailStatic from './GenericDetailStatic';
import GenericDockerDetail from './GenericDockerDetail';
import GenericDetailEditable from './GenericDetailEditable';

export default createReactClass({
  mixins: [createStoreMixin(ComponentStore)],

  getStateFromStores() {
    const componentId = RoutesStore.getCurrentRouteParam('component');

    return {
      component: ComponentStore.getComponent(componentId)
    };
  },

  render() {
    const flags = this.state.component.get('flags');
    if (flags.includes('genericDockerUI')) {
      return (<GenericDockerDetail />);
    } else if (flags.includes('genericUI')) {
      return (<GenericDetailEditable />);
    } else if (flags.includes('genericTemplatesUI')) {
      return (<GenericDockerDetail />);
    } else {
      return (<GenericDetailStatic />);
    }
  }

});
