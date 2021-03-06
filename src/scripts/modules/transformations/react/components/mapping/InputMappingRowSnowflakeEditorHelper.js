import { fromJS, Map, List } from 'immutable';
import { SnowflakeDataTypesMapping } from '../../../Constants';
import { DataTypeKeys } from "../../../../components/MetadataConstants";
import { isNullable } from '../../../../components/utils/datatypeHelpers'

const getDataTypeProvider = (metadata) => {
  const userTypesExist = metadata.find((entry) => {
    return entry.get('key') === DataTypeKeys.BASE_TYPE && entry.get('provider') === 'user';
  });
  if (userTypesExist) {
    return 'user';
  }
  const baseType = metadata.find((entry) => {
    return entry.get('key') === DataTypeKeys.BASE_TYPE;
  });
  if (!baseType) {
    return null;
  }
  return baseType.get('provider');
};

const getMetadataDataTypes = (columnMetadata) => {
  return columnMetadata.map((metadata, colname) => {
    const provider = getDataTypeProvider(metadata);
    if (!provider) {
      return null;
    }
    const baseType = metadata.find((entry) => {
      return entry.get('key') === DataTypeKeys.BASE_TYPE && entry.get('provider') === provider;
    });
    if (!baseType) {
      return null;
    }

    const dataTypeLength = metadata.find((entry) => {
      return entry.get('key') === DataTypeKeys.LENGTH && entry.get('provider') === provider;
    }, null, Map());

    const dataTypeNullable = metadata.find((entry) => {
      return entry.get('key') === DataTypeKeys.NULLABLE && entry.get('provider') === provider;
    }, null, Map());

    const matchedDataType = SnowflakeDataTypesMapping.find((mappedDatatype) => {
      return mappedDatatype.get('basetype') === baseType.get('value');
    });
    if (!matchedDataType) {
      return null;
    }

    const dataTypeName = matchedDataType.get('name');
    let length = matchedDataType.get('size') ? dataTypeLength.get('value', null) : null;
    if (matchedDataType.has('maxLength') && length > matchedDataType.get('maxLength')) {
      length = matchedDataType.get('maxLength');
    }
    return fromJS({
      column: colname,
      type: dataTypeName,
      length: length,
      convertEmptyValuesToNull: isNullable(dataTypeNullable.get('value'))
    });
  });
};

const getTableInitialDataTypes = sourceTable => {
  const tableColumnsMetadata = sourceTable.get('columnMetadata') || Map();
  const datatypes = getMetadataDataTypes(tableColumnsMetadata);
  const primaryKeys = sourceTable.get('primaryKey', List());

  return sourceTable.get('columns', List()).reduce((memo, column) => {
    return memo.set(column, datatypes.get(column, fromJS({
      column: column,
      type: 'VARCHAR',
      length: primaryKeys.has(column) ? 255 : null,
      convertEmptyValuesToNull: false
    })));
  }, Map());
};

export {
  getMetadataDataTypes,
  getTableInitialDataTypes
};
