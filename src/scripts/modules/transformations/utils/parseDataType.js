import {Map} from 'immutable';

export default function(dataTypeDefinition, columnName) {
  if (typeof dataTypeDefinition !== 'string') {
    return dataTypeDefinition;
  }

  // dataTypeDefinition is string so we parse it to object
  const parts = dataTypeDefinition.trim().split(' ');
  const type = parts[0];
  let typeLength = parts.length > 1 ? parts[1] : '';
  if (typeLength.startsWith('(') && typeLength.endsWith(')')) {
    typeLength = typeLength.slice(1, typeLength.length - 1);
  }
  return Map({
    column: columnName,
    type: type,
    length: typeLength
  });
}
