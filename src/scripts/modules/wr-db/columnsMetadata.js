import { List, Map, fromJS } from 'immutable';
import DataTypes from './templates/dataTypes';
import { SnowflakeDataTypesMapping } from '../transformations/Constants';

const uppercasedTypes = ['wr-db-redshift', 'keboola.wr-redshift-v2', 'keboola.wr-db-mysql'];

export function prepareColumnsTypes(componentId, table) {
  const dataTypes = DataTypes[componentId] || List();
  const defaultType = fromJS(dataTypes);
  const columnMetadata = table.get('columnMetadata', List());
  const disabledFields = defaultType.get('disabledFields', List());

  if (columnMetadata.count()) {
    const metadata = getMetadataDataTypes(columnMetadata);

    return table.get('columns').map(column => {
      let type = metadata.getIn([column, 'type'], defaultType.getIn(['default', 'type']));

      if (!uppercasedTypes.includes(componentId)) {
        type = type.toLowerCase();
      }

      return excludeDisabledFields(
        disabledFields,
        fromJS({
          name: column,
          dbName: column,
          type,
          nullable: metadata.getIn([column, 'nullable'], false),
          default: metadata.getIn([column, 'defaultValue'], ''),
          size: metadata.getIn([column, 'size'], defaultType.getIn(['default', 'size'], ''))
        })
      );
    });
  }

  return table.get('columns').map(column => {
    return excludeDisabledFields(
      disabledFields,
      fromJS({
        name: column,
        dbName: column,
        type: defaultType.getIn(['default', 'type'], ''),
        nullable: defaultType.getIn(['default', 'nullable'], false),
        default: defaultType.getIn(['default', 'default'], ''),
        size: defaultType.getIn(['default', 'size'], '')
      })
    );
  });
}

function getMetadataDataTypes(columnMetadata) {
  return columnMetadata.map((data, column) => {
    const baseType = data.find(entry => entry.get('key') === 'KBC.datatype.basetype');

    if (!baseType) {
      return null;
    }

    const datatype = SnowflakeDataTypesMapping.find(type => type.get('basetype') === baseType.get('value'));

    if (!datatype) {
      return null;
    }

    const nullable = data.find(entry => entry.get('key') === 'KBC.datatype.nullable', null, Map());
    const defaultValue = data.find(entry => entry.get('key') === 'KBC.datatype.default', null, Map());
    const length = data.find(entry => entry.get('key') === 'KBC.datatype.length', null, Map());
    const parsedLength = parseInt(length.get('value', 0), 10);
    const size =
      datatype.get('size') && parsedLength > 0
        ? Math.min(parsedLength, datatype.get('maxLength', Number.MAX_SAFE_INTEGER))
        : '';

    return fromJS({
      column,
      size,
      type: datatype.get('name'),
      defaultValue: defaultValue.get('value', ''),
      nullable: !!parseInt(nullable.get('value', 0), 10)
    });
  });
}

function excludeDisabledFields(disabledFields, data) {
  let editedData = data;

  disabledFields.map(field => {
    editedData = editedData.delete(field);
  });

  return editedData;
}
