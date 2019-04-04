import Immutable from 'immutable';
import {emptyComponentState, isEmptyComponentState} from './configurationState';


describe('isEmptyComponentState', function() {
  it('empty legacy state should return true', function() {
    expect(true)
      .toEqual(isEmptyComponentState(Immutable.fromJS({})));
  });
  it('nonempty legacy state should return false', function() {
    expect(false)
      .toEqual(isEmptyComponentState(Immutable.fromJS({key: 'value'})));
  });
  it('empty namespace state should return true', function() {
    expect(true)
      .toEqual(isEmptyComponentState(Immutable.fromJS({component: {}})));
  });
  it('empty namespace state with a sibling should return true', function() {
    expect(true)
      .toEqual(isEmptyComponentState(Immutable.fromJS({component: {}, key: 'value'})));
  });
  it('nonempty namespace state should return false', function() {
    expect(false)
      .toEqual(isEmptyComponentState(Immutable.fromJS({component: {key: 'value'}})));
  });
});

describe('emptyComponentState', function() {
  it('empty legacy state should return empty legacy state', function() {
    expect({})
      .toEqual(emptyComponentState(Immutable.fromJS({})).toJS());
  });
  it('nonempty legacy state should return empty legacy state', function() {
    expect({})
      .toEqual(emptyComponentState(Immutable.fromJS({key: 'value'})).toJS());
  });
  it('empty namespace state should return empty namespace state', function() {
    expect({component: {}})
      .toEqual(emptyComponentState(Immutable.fromJS({component: {}})).toJS());
  });
  it('empty namespace state with a sibling should keep the sibling', function() {
    expect({component: {}, key: 'value'})
      .toEqual(emptyComponentState(Immutable.fromJS({component: {}, key: 'value'})).toJS());
  });
  it('nonempty namespace state should return empty namespace state', function() {
    expect({component: {}})
      .toEqual(emptyComponentState(Immutable.fromJS({component: {key: 'value'}})).toJS());
  });
  it('nonempty namespace state with a sibling should keep the sibling end empty the namespace', function() {
    expect({component: {}, key: 'value'})
      .toEqual(emptyComponentState(Immutable.fromJS({component: {componentKey: 'componentValue'}, key: 'value'})).toJS());
  });
});
