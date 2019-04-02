import { fromJS, Map, List } from 'immutable';
import { SnowflakeDataTypesMapping } from '../../../Constants';
import { DataTypeKeys } from "../../../../components/MetadataConstants";

const getMetadataDataTypes = (columnMetadata) => {
  return columnMetadata.map((metadata, colname) => {
    const baseType = metadata.find((entry) => {
      return entry.get('key') === DataTypeKeys.BASE_TYPE;
    });
    if (!baseType) {
      return null;
    }

    const dataTypeLength = metadata.find((entry) => {
      return entry.get('key') === DataTypeKeys.LENGTH;
    }, null, Map());

    const dataTypeNullable = metadata.find((entry) => {
      return entry.get('key') === DataTypeKeys.NULLABLE;
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
      convertEmptyValuesToNull: !!parseInt(dataTypeNullable.get('value', 0), 10)
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
