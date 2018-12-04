import { fromJS } from 'immutable';
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

    let datatypeLength = metadata.filter((entry) => {
      return entry.get('key') === 'KBC.datatype.length';
    });
    if (datatypeLength.count() > 0) {
      datatypeLength = datatypeLength.get(0);
    }
    let datatypeNullable = metadata.filter((entry) => {
      return entry.get('key') === 'KBC.datatype.nullable';
    });
    if (datatypeNullable.count() > 0) {
      datatypeNullable = datatypeNullable.get(0);
    }

    let datatypeName, length = null;

    let datatype = SnowflakeDataTypesMapping.map((mappedDatatype) => {
      if (mappedDatatype.get('basetype') === baseType.get('value')) {
        datatypeName = mappedDatatype.get('name');
        return mappedDatatype;
      }
    });
    const mapType = datatype.get(datatypeName);
    if (mapType) {
      length = mapType.get('size') ? datatypeLength.get('value') : null;
      if (mapType.has('maxLength') && length > mapType.get('maxLength')) {
        length = mapType.get('maxLength');
      }
    }
    return fromJS({
      column: colname,
      type: datatypeName,
      length: length,
      convertEmptyValuesToNull: isNaN(datatypeNullable.get('value'))
        ? datatypeNullable.get('value')
        : !!parseInt(datatypeNullable.get('value'), 10)
    });
  });
};

export {
  getMetadataDataTypes
};
