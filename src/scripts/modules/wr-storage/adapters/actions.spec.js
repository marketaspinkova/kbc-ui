import Immutable from 'immutable';
import actions from './actions';

describe('actions', function() {
  describe('info()', function() {
    it('should return false for an empty input', function() {
      expect(false).toEqual(actions.info(Immutable.fromJS({})));
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
      expect(expected).toEqual(actions.info(Immutable.fromJS(configuration)).toJS());
    });
  });
});
