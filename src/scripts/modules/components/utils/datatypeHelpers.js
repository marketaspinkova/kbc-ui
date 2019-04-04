import { Map } from 'immutable';
import { DataTypeKeys } from '../../components/MetadataConstants';

const getDataType = function(metadata) {
  const baseType = metadata.find((entry) => {
    return entry.get('key') === DataTypeKeys.BASE_TYPE;
  });
  if (!baseType) {
    return Map();
  }

  const nativeType = metadata.find((entry) => {
    return entry.get('key') === DataTypeKeys.TYPE;
  }, null, Map());

  const length = metadata.find((entry) => {
    return entry.get('key') === DataTypeKeys.LENGTH;
  }, null, Map());

  const nullable = metadata.find((entry) => {
    return entry.get('key') === DataTypeKeys.NULLABLE;
  }, null, Map());

  return Map()
    .set(DataTypeKeys.TYPE, nativeType.get('value'))
    .set(DataTypeKeys.BASE_TYPE, baseType.get('value'))
    .set(DataTypeKeys.LENGTH, length.get('value'))
    .set(DataTypeKeys.NULLABLE, [true, "true", 1, "1"].includes(nullable.get('value')))
    .set('provider', baseType.get('provider'))
    ;
};

export {
  getDataType
};
