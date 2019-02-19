import _ from 'underscore';
import ApplicationStore from '../../../stores/ApplicationStore';
import { FEATURE_EARLY_ADOPTER_PREVIEW, FEATURE_UI_DEVEL_PREVIEW } from '../../../constants/KbcConstants';

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
    return ApplicationStore.hasCurrentAdminFeature(FEATURE_UI_DEVEL_PREVIEW);
  },

  hasCurrentUserEarlyAdopterFeature() {
    return ApplicationStore.hasCurrentAdminFeature(FEATURE_EARLY_ADOPTER_PREVIEW);
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
