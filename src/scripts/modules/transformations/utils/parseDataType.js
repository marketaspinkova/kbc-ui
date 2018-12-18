import {Map} from 'immutable';

export function isDataTypeAsString(dataTypeDefinition) {
  return typeof dataTypeDefinition === 'string';
}

export function parseDataTypeFromString(dataTypeDefinition, columnName) {
  const parts = dataTypeDefinition.trim().split('(');
  const type = parts[0];
  const typeLength = parts.length > 1 ? parts[1].slice(0, parts[1].length - 1) : '';
  return Map({
    column: columnName,
    type: type.trim(),
    length: typeLength
  });
}
