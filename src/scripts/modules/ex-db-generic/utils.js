import ApplicationStore from '../../stores/ApplicationStore';
import { FEATURE_PGSQL_SPLIT_LOADING } from '../../constants/KbcConstants';

const supported = ['keboola.ex-db-pgsql'];

const supportSplitLoading = (componentId) => {
  return supported.includes(componentId)
    && ApplicationStore.hasCurrentProjectFeature(FEATURE_PGSQL_SPLIT_LOADING);
}

export {
  supportSplitLoading
}
