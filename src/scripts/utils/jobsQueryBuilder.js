export function getQuery(componentId, configId, rowId) {
  let query = '+params.component:' + componentId + ' +params.config:' + configId;
  if (rowId) {
    query += ' +(params.row:' + rowId + ' OR (NOT _exists_: params.row))';
  }
  return query;
}

export function getLegacyComponentQuery(componentId, configId, rowId) {
  let query = '+component:' + componentId + ' +params.config:' + configId;
  if (rowId) {
    if (componentId !== 'transformation') {
      throw Error('Component ' + componentId + ' does not support rows');
    }
    query += ' +(params.transformations:' + rowId + ' OR (NOT _exists_: params.transformations))';
  }
  return query;
}
