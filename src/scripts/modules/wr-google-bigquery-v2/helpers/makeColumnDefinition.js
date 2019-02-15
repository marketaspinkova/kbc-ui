import {Types} from './constants';

function prepareFields(column) {
  return {
    type: {
      show: true,
      defaultValue: Types.IGNORE
    },
    dbName: {
      show: column.type !== Types.IGNORE,
      defaultValue: column.name
    }
  };
}

function makeColumnWithDefaults(fields, column) {
  return Object.keys(fields).reduce((memo, field) => {
    const defaultValue = fields[field].defaultValue;
    if (defaultValue && !memo[field]) {
      memo[field] = defaultValue;
    }
    return memo;
  }, column);
}

function processColumnFieldsChange(fields, column, oldColumn) {
  return Object.keys(fields).reduce((memo, field) => {
    const onChange = fields[field].onChange;
    if (onChange && fields[field].show) {
      return onChange(memo, oldColumn);
    }
    return memo;
  }, column);
}

function deleteHiddenFields(fields, column) {
  return Object.keys(fields).reduce((result, field) => {
    if (!fields[field].show) {
      delete result[field];
    }
    return result;
  }, column);
}

export default function makeColumnDefinition(column) {
  const fields = prepareFields(column);
  return {
    column: column,
    fields: fields,
    updateColumn: (property, value) => {
      let updatedColumn = {...column, [property]: value};
      const newFields = prepareFields(updatedColumn);
      updatedColumn = processColumnFieldsChange(newFields, updatedColumn, column);
      updatedColumn = deleteHiddenFields(newFields, updatedColumn);
      return makeColumnDefinition(updatedColumn);
    },
    initColumn: () => makeColumnWithDefaults(fields, column)
  };
}
