import {Map, fromJS} from 'immutable';

export const hasSandbox = (backend, type) => {
  const dockerSandbox = backend === 'docker' && ['python', 'r'].includes(type);
  const otherSandbox = ['redshift', 'snowflake'].includes(backend);
  return dockerSandbox || otherSandbox;
};

export const generateRunParameters = (transformation, bucketId, versionId) => {
  const backend = transformation.get('backend');
  const transformationId = transformation.get('id');
  const nonDockerParams = Map({
    configBucketId: bucketId,
    transformations: [transformationId]
  });
  const dockerParams = fromJS({
    transformation: {
      config_id: bucketId,
      row_id: transformationId,
      config_version: versionId.toString()
    }
  });
  return backend === 'docker' ? dockerParams : nonDockerParams;
};
