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

    let datatypeName, length = null;

    let datatype = SnowflakeDataTypesMapping.map((mappedDatatype) => {
      if (mappedDatatype.get('basetype') === baseType.get('value')) {
        datatypeName = mappedDatatype.get('name');
        return mappedDatatype;
      }
    });
    const mapType = datatype.get(datatypeName);
    if (mapType) {
      length = mapType.get('size') ? dataTypeLength.get('value') : null;
      if (mapType.has('maxLength') && length > mapType.get('maxLength')) {
        length = mapType.get('maxLength');
      }
    }
    return fromJS({
      column: colname,
      type: datatypeName,
      length: length,
      convertEmptyValuesToNull: isNaN(dataTypeNullable.get('value'))
        ? dataTypeNullable.get('value')
        : !!parseInt(dataTypeNullable.get('value'), 10)
    });
  });
};

export {
  getMetadataDataTypes
};
