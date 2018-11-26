import Immutable from 'immutable';
import SyrupApi from '../components/SyrupComponentApi';

const createRequest = (method, path) => SyrupApi.createRequest('gooddata-writer', method, path);

export default {
  getWriter(configurationId) {
    return createRequest('GET', `v2/${configurationId}?include=project,project.ssoLink`)
      .promise()
      .then((response) => response.body);
  },

  getWriterModel(configurationId) {
    return (
      createRequest('GET', `v2/${configurationId}/model`)
      // .query config: configurationId
        .promise()
        .then((response) => response.body)
    );
  },

  getWriterTables(configurationId) {
    return (
      createRequest('GET', `v2/${configurationId}/tables`)
        .promise()
        .then((response) => response.body)
    );
  },

  deleteWriterTable(configurationId, tableId) {
    return createRequest('DELETE', `v2/${configurationId}/tables/${tableId}`)
      .promise()
      .then((response) => response.body);
  },

  addWriterTable(configurationId, tableId, data) {
    return createRequest('POST', `v2/${configurationId}/tables/${tableId}`)
      .send(data.toJS())
      .promise()
      .then((response) => response.body);
  },

  getTableDetail(configurationId, tableId) {
    return createRequest('GET', `v2/${configurationId}/tables/${tableId}`)
      .query({ include: 'columns' })
      .promise()
      .then((response) => response.body);
  },

  getReferenceableTables(configurationId) {
    return createRequest('GET', `v2/${configurationId}/referenceable-tables`)
      .promise()
      .then((response) => response.body);
  },

  updateTable(configurationId, tableId, data) {
    return createRequest('PATCH', `v2/${configurationId}/tables/${tableId}`)
      .send(data)
      .promise()
      .then((response) => response.body);
  },

  resetTable(configurationId, tableId, pid) {
    return createRequest('DELETE', `v2/${configurationId}/projects/${pid}/datasets/${tableId}`)
      .promise()
      .then((response) => response.body);
  },

  synchronizeTable(configurationId, tableId, pid) {
    return (
      createRequest('POST', `v2/${configurationId}/tables/${tableId}/synchronize/${pid}`)
        .promise()
        .then((response) => response.body)
    );
  },

  uploadTable(configurationId, tableId) {
    return createRequest('POST', 'upload-table')
      .send({
        tableId,
        config: configurationId
      })
      .promise()
      .then((response) => response.body);
  },

  uploadDateDimension(configurationId, dimensionName, pid) {
    return (
      createRequest('POST', `v2/${configurationId}/date-dimensions/${dimensionName}/upload/${pid}`)
      // .send
      //   name: dimensionName
      //   config: configurationId
        .promise()
        .then((response) => response.body)
    );
  },

  uploadProject(configurationId) {
    return createRequest('POST', 'upload-project')
      .send({
        config: configurationId
      })
      .promise()
      .then((response) => response.body);
  },

  optimizeSLIHash(configurationId, pid) {
    return createRequest('POST', `v2/${configurationId}/projects/${pid}/optimize-sli-hash`)
      .promise()
      .then((response) => response.body);
  },

  resetProject(configurationId, pid) {
    return createRequest('DELETE', `v2/${configurationId}/projects/${pid}`)
      .promise()
      .then((response) => response.body);
  },

  deleteWriter(configurationId) {
    return createRequest('DELETE', `v2/${configurationId}`)
      .promise()
      .then((response) => response.body);
  },

  getDateDimensions(configurationId) {
    return createRequest('GET', `v2/${configurationId}/date-dimensions`)
      .promise()
      .then((response) => response.body);
  },

  deleteDateDimension(configurationId, name) {
    return createRequest('DELETE', `v2/${configurationId}/date-dimensions/${name}`)
      .promise()
      .then((response) => response.body);
  },

  createDateDimension(configurationId, dateDimension) {
    const data = Immutable.fromJS(dateDimension);

    return createRequest('POST', `v2/${configurationId}/date-dimensions`)
      .send(data.toJS())
      .promise()
      .then((response) => response.body);
  },

  enableProjectAccess(configurationId, pid) {
    return createRequest('POST', `v2/${configurationId}/projects/${pid}/access`)
      .promise()
      .then((response) => response.body);
  },

  disableProjectAccess(configurationId, pid) {
    return createRequest('DELETE', `v2/${configurationId}/projects/${pid}/access`)
      .promise()
      .then((response) => response.body);
  }
};
