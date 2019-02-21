import { List, Map, fromJS } from 'immutable';
import DataTypes from './dataTypes';
import SnowflakeDataTypesMapping from '../../transformations/mapping/snowflake';

export function prepareColumnsTypes(componentId, table) {
  if (!DataTypes[componentId]) {
    return List();
  }

  const defaultType = fromJS(DataTypes[componentId].default || {});
  const columnMetadata = table.get('columnMetadata', List());

  if (componentId === 'keboola.wr-db-snowflake' && columnMetadata.count()) {
    const metadata = getSnowflakeMetadataDataTypes(columnMetadata);

    return table.get('columns').map(column => {
      return fromJS({
        name: column,
        dbName: column,
        type: metadata.getIn([column, 'type'], defaultType.get('type')).toLowerCase(),
        nullable: metadata.getIn([column, 'nullable'], false),
        default: metadata.getIn([column, 'defaultValue'], ''),
        size: metadata.getIn([column, 'size'], defaultType.get('size', ''))
      });
    });
  }

  return table.get('columns').map(column => {
    return fromJS({
      name: column,
      dbName: column,
      type: defaultType.get('type', ''),
      nullable: defaultType.get('nullable', false),
      default: defaultType.get('default', ''),
      size: defaultType.get('size', '')
    });
  });
}

function getSnowflakeMetadataDataTypes(columnMetadata) {
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
