import Immutable from 'immutable';

export default {
  createConfiguration: function(localState) {
    return Immutable.fromJS({
      parameters: {
        host: localState.get('host', ''),
        port: localState.get('port', ''),
        connectionType: localState.get('connectionType', ''),
        timeout: localState.get('timeout', ''),
        username: localState.get('username', ''),
        '#password': localState.get('password', ''),
        '#privateKey': localState.get('privateKey', '')
      }
    });
  },

  parseConfiguration: function(configuration) {
    return Immutable.fromJS({
      host: configuration.getIn(['parameters', 'host'], ''),
      port: configuration.getIn(['parameters', 'port'], ''),
      connectionType: configuration.getIn(['parameters', 'connectionType'], ''),
      timeout: configuration.getIn(['parameters', 'timeout'], ''),
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
     && configuration.getIn(['parameters', 'timeout'], '') !== ''
    ;
  }
}
;