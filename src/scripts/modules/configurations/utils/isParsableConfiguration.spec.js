import Immutable from 'immutable';
import isParsableConfiguration from './isParsableConfiguration';

const create = function(localState) {
  return Immutable.fromJS({
    key1: localState.get('key1', ''),
    key2: localState.get('key2', ''),
    nested: {
      key1: localState.get('nestedKey1'),
      key2: localState.get('nestedKey2')
    }
  });
};

const parse = function(configuration) {
  return Immutable.fromJS({
    key1: configuration.get('key1', ''),
    key2: configuration.get('key2', ''),
    nestedKey1: configuration.getIn(['nested', 'key1'], ''),
    nestedKey2: configuration.getIn(['nested', 'key2'], '')
  });
};

describe('isParsableConfiguration', function() {
  it('empty configuration should be parsable', function() {
    const configuration = Immutable.fromJS({});
    expect(true).toEqual(isParsableConfiguration(configuration, parse, create));
  });
  it('simple full configuration should be parsable', function() {
    const configuration = Immutable.fromJS({
      key1: 'test1',
      key2: 'test2',
      nested: {
        key1: 'test3',
        key2: 'test4'
      }
    });
    expect(true).toEqual(isParsableConfiguration(configuration, parse, create));
  });
  it('invalid configuration should not be parsable', function() {
    const configuration = Immutable.fromJS({
      invalidKey1: 'test',
      key1: 'test1',
      key2: 'test2',
      nested: {
        key1: 'test3',
        key2: 'test4'
      }
    });
    expect(false).toEqual(isParsableConfiguration(configuration, parse, create));
  });
});
