import assert from 'assert';
import Immutable from 'immutable';
import actions from './actions';

describe('actions', function() {
  describe('info()', function() {
    it('should return false for an empty input', function() {
      assert.equal(false, actions.info(Immutable.fromJS({})));
    });
    it('should return valid payload for a valid input', function() {
      const expected = {
        configData: {
          parameters: {
            '#token': '123',
            url: 'abc'
          }
        }
      };
      const configuration = {
        parameters: {
          '#token': '123',
          url: 'abc'
        }
      };
      assert.deepEqual(expected, actions.info(Immutable.fromJS(configuration)).toJS());
    });
  });
});
