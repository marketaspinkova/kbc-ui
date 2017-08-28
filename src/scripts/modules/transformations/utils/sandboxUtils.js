import {Map} from 'immutable';

const _decamelizeTableInput = (table) => {
  return table.reduce((memo, value, key) => {
    const newKey = key.replace(/[A-Z]/g, (match) =>  '_' + match.toLowerCase());
    return memo.set(newKey, value);
  }, Map());
};

const normalizeDockerInputMapping = (table) => {
  const allowedKeys = ['source', 'destination', 'columns', 'days', 'where_column', 'where_operator', 'where_values', 'limit'];
  return table.filter((value, key) => allowedKeys.includes(key));
};

export const hasSandbox = (backend, type) => {
  const mysqlSandbox = backend === 'mysql' && type === 'simple';
  const dockerSandbox = backend === 'docker' && ['python', 'r'].includes(type);
  const otherSandbox = ['redshift', 'snowflake'].includes(backend);
  return mysqlSandbox || dockerSandbox || otherSandbox;
};

export const generateRunParameters = (transformation, bucketId) => {
  const backend = transformation.get('backend');
  const transformationId = transformation.get('id');
  const transformationType = transformation.get('type');
  const nonDockerParams = Map({
    configBucketId: bucketId,
    transformations: [transformationId]
  });
  const dockerParams = Map({
    type: transformationType === 'python' ? 'jupyter' : 'rstudio',
    packages: transformation.get('packages'),
    tags: transformation.get('tags'),
    script: transformation.get('queriesString'),
    input: {
      tables: transformation
        .get('input')
        .map(_decamelizeTableInput)
        .map(normalizeDockerInputMapping)
    }
  });
  return backend === 'docker' ? dockerParams : nonDockerParams;
};