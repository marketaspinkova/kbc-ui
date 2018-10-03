import {Types, DataTypes} from './Constants';

const BASE_TYPES = [
  Types.CONNECTION_POINT,
  Types.ATTRIBUTE,
  Types.FACT
];

// export const mustHave;

function checkEmpty(value, label) {
  return !value && ((label || 'Value') + ' can not be empty');
}

function checkDataTypeSize(dataType, dataTypeSize) {
  if (dataType === DataTypes.VARCHAR && isNaN(dataTypeSize)) {
    return 'Data size must by valid number: ' + dataTypeSize;
  }
  if (dataType === DataTypes.DECIMAL && !/^\d+,\d+$/.test(dataTypeSize)) {
    return 'Ivalid decimal format' + dataTypeSize;
  }
  return false;
}

function prepareFields(column) {
  const {type, dataType} = column;
  return {
    type: {
      show: true,
      invalidReason: checkEmpty(column.type, 'Type'),
      defaultValue: 'IGNORE'
    },
    title: {
      show: BASE_TYPES.includes(type),
      invalidReason: checkEmpty(column.title, 'GoodData Title'),
      defaultValue: column.id
    },

    dataType: {
      show: BASE_TYPES.includes(type)
    },

    dataTypeSize: {
      show: BASE_TYPES.includes(type) && [DataTypes.VARCHAR, DataTypes.DECIMAL].includes(dataType),
      invalidReason: checkDataTypeSize(dataType, column.dataTypeSize),
      defaultValue: column.dataType === DataTypes.VARCHAR ? '255' : '12,2',
      onChange: (newColumn, oldColumn) => {
        if (newColumn.dataType !== oldColumn.dataType) {
          switch (newColumn.dataType) {
            case DataTypes.VARCHAR:
              newColumn.dataTypeSize = '255';
              break;
            case DataTypes.DECIMAL:
              newColumn.dataTypeSize = '12,2';
              break;
            default:
              break;
          }
        }
        return newColumn;
      }
    },
    reference: {
      show: [Types.HYPERLINK, Types.LABEL].includes(type),
      invalidReason: checkEmpty(column.reference, 'Reference')
    },
    schemaReference: {
      show: type === Types.REFERENCE
    },
    sortLabel: {
      show: type === Types.ATTRIBUTE
    },
    sortOrder: {
      show: type === Types.ATTRIBUTE && column.sortLabel,
      defaultValue: 'ASC'
    },
    format: {
      show: type === Types.DATE,
      invalidReason: checkEmpty(column.format, 'Date format'),
      defaultValue: 'yyyy-MM-dd HH:mm:ss'
    },
    dateDimension: {
      show: type === Types.DATE,
      invalidReason: checkEmpty(column.dateDimension, 'Date dimension')
    },
    identifier: {
      show: BASE_TYPES.includes(type)
    },
    identifierLabel: {
      show: type === Types.ATTRIBUTE
    },
    identifierSortLabel: {
      show: type === Types.ATTRIBUTE
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

function getInvalidReason(fields) {
  return Object.keys(fields).reduce((memo, field) => {
    const reason = fields[field].show ? fields[field].invalidReason : null;
    return memo || reason;
  }, false);
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
    getInvalidReason: () => getInvalidReason(fields),
    updateColumn: (property, value) => {
      let updatedColumn = {...column, [property]: value};
      if (property === 'dataType') {
        delete updatedColumn.dataTypeSize;
      }
      const newFields = prepareFields(updatedColumn);
      updatedColumn = processColumnFieldsChange(newFields, updatedColumn, column);
      updatedColumn = deleteHiddenFields(newFields, updatedColumn);
      return makeColumnDefinition(updatedColumn);
    },
    initColumn: () => makeColumnWithDefaults(fields, column)
  };
}
