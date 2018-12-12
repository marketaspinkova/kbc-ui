import Immutable from 'immutable';

const infoAction = function(configuration) {
  if (!configuration.hasIn(['parameters', '#token']) || !configuration.hasIn(['parameters', 'url'])) {
    return false;
  }
  return Immutable.fromJS({
    configData: {
      parameters: {
        '#token': configuration.getIn(['parameters', '#token'], ''),
        url: configuration.getIn(['parameters', 'url'], '')
      }
    }
  });
};

export default {
  info: infoAction
};