
import { Map, List } from 'immutable';

const hasTableColumnMetadataDatatypes = table => {
  const provider = getLastActiveProvider(table);

  if (!provider) {
    return false;
  }

  return table.get('columnMetadata').filter((metadataList) => {
    return metadataList.filter((metadata) => {
      return metadata.get('provider') === provider && metadata.get('key') === 'KBC.datatype.basetype';
    }).count() > 0;
  }).count() > 0;
};

const getColumnMetadataByProvider = (table, provider) => {
  return table.get('columnMetadata', Map()).map((metadata) => {
    return metadata.filter(data => data.get('provider') === provider);
  }) 
};

const getMachineColumnMetadata = (table) => {
  const provider = getLastActiveProvider(table, { exclude: ['user'] });

  if (!provider) {
    return Map();
  }

  return getColumnMetadataByProvider(table, provider);
};

const getUserColumnMetadata = (table) => {
  return getColumnMetadataByProvider(table, 'user');
};

const getLastActiveProvider = (table, options = {}) => {
  const exclude = options.exclude || [];
  const latestUpdatedMetadata = table.get('columnMetadata', Map())
    .reduce((list, metadata) => list.concat(metadata), List())
    .filter((metadata) => !exclude.includes(metadata.get('provider')))
    .sortBy((metadata) => -1 * new Date(metadata.get('timestamp')).getTime())
    .first();

  return latestUpdatedMetadata ? latestUpdatedMetadata.get('provider') : null;
};

export {
  hasTableColumnMetadataDatatypes,
  getColumnMetadataByProvider,
  getMachineColumnMetadata,
  getUserColumnMetadata
};
