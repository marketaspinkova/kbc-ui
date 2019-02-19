import _ from 'underscore';
import ApplicationStore from '../../../stores/ApplicationStore';

// hardcoded array of hiden components(under construction components)
// possible alternative is hasUI component property
const hiddenComponents = [];

export default {
  isComponentAllowed(componentId) {
    const isHidden = hiddenComponents.includes(componentId);
    // route is not hidden or if it is hidden then it must be explicitely allowed
    // via admin feature
    return !isHidden || this.hasDevelPreview(componentId);
  },

  hasDevelPreview(componentId) {
    const isHidden = hiddenComponents.includes(componentId);
    return isHidden && this.hasCurrentUserDevelPreview();
  },

  hasCurrentUserDevelPreview() {
    const adminFeature = 'ui-devel-preview';
    return ApplicationStore.hasCurrentAdminFeature(adminFeature);
  },

  hasCurrentUserEarlyAdopterFeature() {
    const adminFeature = 'early-adopter-preview';
    return ApplicationStore.hasCurrentAdminFeature(adminFeature);
  },

  filterHiddenRoutes(routes) {
    const stack = [routes];
    while (!_.isEmpty(stack)) {
      const tmpRoutes = stack.pop();
      const result = [];
      if (!tmpRoutes.childRoutes) {
        continue;
      }
      for (let r of tmpRoutes.childRoutes) {
        if (this.isComponentAllowed(r.name)) {
          stack.push(r);
          result.push(r);
        }
      }
      tmpRoutes.childRoutes = result;
    }
    return routes;
  }
};
