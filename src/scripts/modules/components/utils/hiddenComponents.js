import ApplicationStore from '../../../stores/ApplicationStore';
import { FEATURE_EARLY_ADOPTER_PREVIEW, FEATURE_UI_DEVEL_PREVIEW } from '../../../constants/KbcConstants';

export default {
  hasCurrentUserDevelPreview() {
    return ApplicationStore.hasCurrentAdminFeature(FEATURE_UI_DEVEL_PREVIEW);
  },

  hasCurrentUserEarlyAdopterFeature() {
    return ApplicationStore.hasCurrentAdminFeature(FEATURE_EARLY_ADOPTER_PREVIEW);
  }
};
