import {Map, fromJS} from 'immutable';
export default {
  parseConfiguration(configuration) {
    const params = configuration.get('parameters', Map());
    return fromJS({
      pid: params.getIn(['project', 'pid'], ''),
      login: params.getIn(['user', 'login'], ''),
      password: params.getIn(['user', 'password'], '')
    });
  },
  createConfiguration(localState) {
    return fromJS({
      parameters: {
        project: {
          pid: localState.get('pid')
        },
        user: {
          login: localState.get('login'),
          '#password': localState.get('password')
        }
      }
    });
  }
};
