import RoutesStore from '../../../stores/RoutesStore';
import ComponentsStore from '../stores/ComponentsStore';
import { Routes } from '../Constants';

export default (componentId, configurationId) => {
  const components = ComponentsStore.getAll();

  if (RoutesStore.hasRoute(componentId)) {
    return RoutesStore.getRouter().transitionTo(componentId, { config: configurationId });
  }

  if (ComponentsStore.hasComponentLegacyUI(componentId)) {
    window.location = ComponentsStore.getComponentDetailLegacyUrl(componentId, configurationId);
    return;
  }

  if (
    components.getIn([componentId, 'flags']).includes('genericUI') ||
    components.getIn([componentId, 'flags']).includes('genericDockerUI') ||
    components.getIn([componentId, 'flags']).includes('genericTemplatesUI')
  ) {
    return RoutesStore.getRouter().transitionTo(
      Routes.GENERIC_DETAIL_PREFIX + components.getIn([componentId, 'type']) + '-config',
      {
        component: componentId,
        config: configurationId
      }
    );
  }

  if (componentId === 'transformation') {
    return RoutesStore.getRouter().transitionTo('transformationBucket', { config: configurationId });
  }

  throw new Error(`Component ${componentId} has no UI to link to`);
};
