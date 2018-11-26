export function getQuery(componentId, configId) {
  return '+params.component:' + componentId + ' +params.config:' + configId;
}

export function getLegacyComponentQuery(componentId, configId) {
  return '+component:' + componentId + ' +params.config:' + configId;
}
