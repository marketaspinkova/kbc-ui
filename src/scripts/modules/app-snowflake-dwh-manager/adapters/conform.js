import { List, Map } from 'immutable';

export function conform(configuration) {
  const oldSchema = configuration.getIn(['parameters', 'user', 'business_schemas'], false);
  if (oldSchema === false) {
    return configuration;
  }
  const newSchema = configuration.getIn(['parameters', 'user', 'schemas'], List());
  const oldSchemaNewFormat = oldSchema.map(schemaName => {
    return Map({name: schemaName, permission: 'read'});
  });

  let finalSchemas = newSchema.push(...oldSchemaNewFormat);
  return configuration
    .setIn(['parameters', 'user', 'schemas'], finalSchemas)
    .deleteIn(['parameters', 'user', 'business_schemas']);
}
