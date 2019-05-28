import { List, Map, fromJS } from 'immutable';
import DataTypes from './dataTypes';
import { SnowflakeDataTypesMapping } from '../../transformations/Constants';
import { isNullable } from '../../components/utils/datatypeHelpers';

const BASETYPE = 'KBC.datatype.basetype';
const NULLABLE = 'KBC.datatype.nullable';
const DEFAULT = 'KBC.datatype.default';
const LENGTH = 'KBC.datatype.length';

export function prepareColumnsTypes(componentId, table) {
  if (!DataTypes[componentId]) {
    return List();
  }

  const defaultType = fromJS(DataTypes[componentId].default || {});
  const columnMetadata = table.get('columnMetadata', List());

  if (componentId === 'keboola.wr-db-snowflake' && columnMetadata.count()) {
    const metadata = getSnowflakeMetadataDataTypes(columnMetadata);

    return table.get('columns').map((column) => {
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

  return table.get('columns').map((column) => {
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
    const systemBaseType = data
      .filter((entry) => entry.get('provider') !== 'user')
      .sortBy((row) => -1 * new Date(row.get('timestamp')).getTime())
      .find((entry) => entry.get('key') === BASETYPE);

    const baseType = data.find((entry) => entry.get('key') === BASETYPE && entry.get('provider') === 'user', null, systemBaseType);

    if (!baseType) {
      return null;
    }

    const datatype = SnowflakeDataTypesMapping.find((type) => type.get('basetype') === baseType.get('value'));

    if (!datatype) {
      return null;
    }

    const byProvider = data.filter((entry) => entry.get('provider') === baseType.get('provider'));
    const nullable = byProvider.find((entry) => entry.get('key') === NULLABLE, null, Map());
    const defaultValue = byProvider.find((entry) => entry.get('key') === DEFAULT, null, Map());
    const length = byProvider.find((entry) => entry.get('key') === LENGTH, null, Map());

    return fromJS({
      column,
      size: length.get('value', ''),
      type: datatype.get('name'),
      defaultValue: defaultValue.get('value', ''),
      nullable: isNullable(nullable.get('value', 0))
    });
  });
}
