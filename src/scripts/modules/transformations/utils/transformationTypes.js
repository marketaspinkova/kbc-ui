import {transformationBackend, transformationLabels } from '../Constants';

const resolveBackendName = function (transformation) {
  if (transformation.get('backend') === transformationBackend.DOCKER) {
    return transformation.get('type');
  } else {
    return transformation.get('backend');
  }
};

const isKnownTransformationType = function (transformation) {
  if (!transformationLabels[resolveBackendName(transformation)]) {
    return false;
  }
  return true;
};

export {
  resolveBackendName,
  isKnownTransformationType
};
