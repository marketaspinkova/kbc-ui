import Immutable from 'immutable';

export function createConfiguration(localState) {
  const isUser = localState.get('type') === 'user';
  const isSchema = localState.get('type') === 'schema';
  if (isUser) {
    const schemasReadState = localState.get('schemas_read', Immutable.List());
    const schemasWriteState = localState.get('schemas_write', Immutable.List());
    const schemasRead = schemasReadState.toJS()
      .map(schemaName => {
        return {name: schemaName, permission: 'read'};
      });
    const schemasWrite = schemasWriteState.toJS()
      .map(schemaName => {
        return {name: schemaName, permission: 'write'};
      });

    return Immutable.fromJS({
      parameters: {
        user: {
          email: localState.get('email', ''),
          schemas: schemasRead.concat(schemasWrite),
          disabled: localState.get('disabled', false)
        }
      }
    });
  }
  if (isSchema) {
    return Immutable.fromJS({
      parameters: {
        business_schema: {
          schema_name: localState.get('schema_name', '')
        }
      }
    });
  }
}

export function parseConfiguration(configuration) {
  const isUser = configuration.getIn(['parameters', 'user'], false) !== false;
  const isSchema = configuration.getIn(['parameters', 'business_schema'], false) !== false;

  if (isUser) {
    const schemasInConfig = configuration.getIn(['parameters', 'user', 'schemas'], Immutable.List());
    const schemasRead = schemasInConfig
      .toJS()
      .filter(spec => spec.permission === 'read')
      .map(spec => spec.name);
    const schemasWrite = schemasInConfig
      .toJS()
      .filter(spec => spec.permission === 'write')
      .map(spec => spec.name);

    return Immutable.fromJS({
      type: 'user',
      email: configuration.getIn(['parameters', 'user', 'email'], ''),
      schemas_read: schemasRead,
      schemas_write: schemasWrite,
      disabled: configuration.getIn(['parameters', 'user', 'disabled'], false)
    });
  }
  if (isSchema) {
    return Immutable.fromJS({
      type: 'schema',
      schema_name: configuration.getIn(['parameters', 'business_schema', 'schema_name'], '')
    });
  }

  // schema is default
  return Immutable.fromJS({
    type: 'schema'
  });
}

export function createEmptyConfiguration(name) {
  return createConfiguration(Immutable.fromJS({type: 'schema', schema_name: name}));
}
