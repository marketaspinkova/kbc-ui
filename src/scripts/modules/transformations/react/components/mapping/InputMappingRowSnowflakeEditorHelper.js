import { fromJS, Map } from 'immutable';
import { SnowflakeDataTypesMapping } from '../../../Constants';

const getMetadataDataTypes = (columnMetadata) => {
  return columnMetadata.map((metadata, colname) => {
    const baseType = metadata.find((entry) => {
      return entry.get('key') === 'KBC.datatype.basetype';
    });
    if (!baseType) {
      return null;
    }

    const dataTypeLength = metadata.find((entry) => {
      return entry.get('key') === 'KBC.datatype.length';
    }, null, Map());

    const dataTypeNullable = metadata.find((entry) => {
      return entry.get('key') === 'KBC.datatype.nullable';
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

export {
  getMetadataDataTypes
};
