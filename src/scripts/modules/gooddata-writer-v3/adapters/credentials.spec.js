import assert from 'assert';
import {Map, fromJS} from 'immutable';
import adapter from './credentials';


describe('gooddata writer v3 credentials testing', () => {
  it('should parse empty configuration', () => {
    const parsed = adapter.parseConfiguration(Map());
    const localState = {pid: '', login: '', password: ''};
    assert.deepEqual(localState, parsed.toJS());
  });

  it('should parse/create some credentials', () => {
    const localState = {
      pid: 'pid',
      login: 'login',
      password: 'pass'
    };
    const configuration = {
      parameters: {
        project: {
          pid: 'pid'
        },
        user: {
          login: 'login',
          '#password': 'pass'
        }
      }
    };
    const parsed = adapter.parseConfiguration(fromJS(configuration));
    const created = adapter.createConfiguration(fromJS(localState));
    assert.deepEqual(localState, parsed.toJS());
    assert.deepEqual(configuration, created.toJS());
  });
});
