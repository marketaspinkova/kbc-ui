import { Map, fromJS } from 'immutable';
import { DataTypeKeys, BaseTypes } from '../../components/MetadataConstants';

const isNullable = (value) => [true, "true", 1, "1"].includes(value);

const getDataType = function(metadata) {
  const baseType = metadata.find((entry) => {
    return entry.get('key') === DataTypeKeys.BASE_TYPE;
  });
  if (!baseType || !fromJS(BaseTypes).contains(baseType.get('value'))) {
    return Map();
  }

  let outputType = Map()
    .set(DataTypeKeys.BASE_TYPE, baseType.get('value'))
    .set('provider', baseType.get('provider'));

  const nativeType = metadata.find((entry) => {
    return entry.get('key') === DataTypeKeys.TYPE;
  });
  if (nativeType) {
    outputType = outputType.set(DataTypeKeys.TYPE, nativeType.get('value'));
  }

  const length = metadata.find((entry) => {
    return entry.get('key') === DataTypeKeys.LENGTH;
  });
  if (length) {
    outputType = outputType.set(DataTypeKeys.LENGTH, length.get('value'));
  }

  const nullable = metadata.find((entry) => {
    return entry.get('key') === DataTypeKeys.NULLABLE;
  });
  if (nullable) {
    outputType = outputType.set(
      DataTypeKeys.NULLABLE,
      isNullable(nullable.get('value'))
    );
  }

  return outputType;
};

export {
  getDataType,
  isNullable
};
