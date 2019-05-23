import ApplicationStore from '../../stores/ApplicationStore';

const supported = ['keboola.ex-db-pgsql'];

const supportSplitLoading = (componentId) => {
  return supported.includes(componentId) && ApplicationStore.hasCurrentProjectFeature('pgsql-split-loading');
}

export {
  supportSplitLoading
}