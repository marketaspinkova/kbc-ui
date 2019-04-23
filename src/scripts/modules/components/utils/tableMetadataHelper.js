
import { Map, List } from 'immutable';

const hasTableColumnMetadataDatatypes = table => {
  const lastUpdateInfo = getTableLastUpdatedInfo(table);

  if (!lastUpdateInfo) {
    return false;
  }

  return table.get('columnMetadata').filter((metadataList) => {
    return metadataList.filter((metadata) => {
      return metadata.get('provider') === lastUpdateInfo.component && metadata.get('key') === 'KBC.datatype.basetype';
    }).count() > 0;
  }).count() > 0;
};

const getTableLastUpdatedInfo = (table) => {
  const metadata = table.get('metadata', List()).filter(row => row.get('provider') === 'system', null, Map());
  let componentFound = metadata.find(row => row.get('key') === 'KBC.lastUpdatedBy.component.id');
  let configFound = metadata.find(row => row.get('key') === 'KBC.lastUpdatedBy.configuration.id');

  if (!componentFound || !configFound) {
    componentFound = metadata.find(row => row.get('key') === 'KBC.createdBy.component.id');
    configFound = metadata.find(row => row.get('key') === 'KBC.createdBy.configuration.id');
  }

  if (!componentFound || !configFound) {
    return null;
  }

  return {
    'component': componentFound.get('value'),
    'config': configFound.get('value'),
    'timestamp': configFound.get('timestamp')
  };
};

const getColumnMetadataByProvider = (table, provider) => {
  return table.get('columnMetadata', Map()).map((metadata) => {
    return metadata.filter(data => data.get('provider') === provider);
  }) 
};

const getMachineColumnMetadata = (table) => {
  const lastUpdateInfo = getTableLastUpdatedInfo(table);

  if (!lastUpdateInfo || !lastUpdateInfo.component) {
    return Map();
  }

  return getColumnMetadataByProvider(table, lastUpdateInfo.component);
};

const getUserColumnMetadata = (table) => {
  return getColumnMetadataByProvider(table, 'user');
};

export {
  hasTableColumnMetadataDatatypes,
  getTableLastUpdatedInfo,
  getColumnMetadataByProvider,
  getMachineColumnMetadata,
  getUserColumnMetadata
};
