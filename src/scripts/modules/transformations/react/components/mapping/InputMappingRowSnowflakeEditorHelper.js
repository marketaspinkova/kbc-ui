import { fromJS, Map } from 'immutable';
import { SnowflakeDataTypesMapping } from '../../../Constants';

const getMetadataDataTypes = (columnMetadata) => {
  return columnMetadata.map((metadata, colname) => {
    const baseTypes = metadata.filter((entry) => {
      return entry.get('key') === 'KBC.datatype.basetype';
    });
    if (baseTypes.count() === 0) {
      return null;
    }
    const baseType = baseTypes.get(0);

    const dataTypeLengths = metadata.filter((entry) => {
      return entry.get('key') === 'KBC.datatype.length';
    });
    const dataTypeLength = dataTypeLengths.count() > 0 ? dataTypeLengths.get(0) : Map();

    const dataTypeNullables = metadata.filter((entry) => {
      return entry.get('key') === 'KBC.datatype.nullable';
    });
    const dataTypeNullable = dataTypeNullables.count() > 0 ? dataTypeNullables.get(0) : Map();

    const matchedDataType = SnowflakeDataTypesMapping.find((mappedDatatype) => {
      return mappedDatatype.get('basetype') === baseType.get('value');
    });

    const dataTypeName = matchedDataType ? matchedDataType.get('name') : null;
    let length = null;

    if (matchedDataType) {
      length = matchedDataType.get('size') ? dataTypeLength.get('value', null) : null;
      if (matchedDataType.has('maxLength') && length > matchedDataType.get('maxLength')) {
        length = matchedDataType.get('maxLength');
      }
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
