import Immutable from 'immutable';

export default {
  createConfiguration: function(localState) {
    return Immutable.fromJS({
      parameters: {
        host: localState.get('host', ''),
        port: parseInt(localState.get('port', 21), 10),
        connectionType: localState.get('connectionType', ''),
        timeout: parseInt(localState.get('timeout', 10), 10),
        username: localState.get('username', ''),
        '#password': localState.get('password', ''),
        '#privateKey': localState.get('privateKey', '')
      }
    });
  },

  parseConfiguration: function(configuration) {
    return Immutable.fromJS({
      host: configuration.getIn(['parameters', 'host'], ''),
      port: configuration.getIn(['parameters', 'port'], 21),
      connectionType: configuration.getIn(['parameters', 'connectionType'], ''),
      timeout: configuration.getIn(['parameters', 'timeout'], 10),
      username: configuration.getIn(['parameters', 'username'], ''),
      password: configuration.getIn(['parameters', '#password'], ''),
      privateKey: configuration.getIn(['parameters', '#privateKey'], '')
    });
  },

  isComplete: function(configuration) {
    return configuration.getIn(['parameters', 'host'], '') !== ''
      && configuration.getIn(['parameters', 'port'], '') !== ''
      && configuration.getIn(['parameters', 'connectionType'], '') !== ''
      && configuration.getIn(['parameters', 'username'], '') !== ''
      && configuration.getIn(['parameters', '#password'], '') !== ''
      && configuration.getIn(['parameters', 'timeout'], '') !== '';
  },

  createEmptyConfiguration: function() {
    return this.createConfiguration(Immutable.fromJS({'timeout': 10, 'port': 21}));
  }
}
;