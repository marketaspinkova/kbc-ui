import Immutable from 'immutable';
import {emptyComponentState, isEmptyComponentState, removeTableFromInputTableState} from './configurationState';


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
  it('empty legacy state should return empty legacy state', function () {
    expect({})
      .toEqual(emptyComponentState(Immutable.fromJS({})).toJS());
  });
  it('nonempty legacy state should return empty legacy state', function () {
    expect({})
      .toEqual(emptyComponentState(Immutable.fromJS({key: 'value'})).toJS());
  });
  it('empty namespace state should return empty namespace state', function () {
    expect({component: {}})
      .toEqual(emptyComponentState(Immutable.fromJS({component: {}})).toJS());
  });
  it('empty namespace state with a sibling should keep the sibling', function () {
    expect({component: {}, key: 'value'})
      .toEqual(emptyComponentState(Immutable.fromJS({component: {}, key: 'value'})).toJS());
  });
  it('nonempty namespace state should return empty namespace state', function () {
    expect({component: {}})
      .toEqual(emptyComponentState(Immutable.fromJS({component: {key: 'value'}})).toJS());
  });
  it('nonempty namespace state with a sibling should keep the sibling end empty the namespace', function () {
    expect({component: {}, key: 'value'})
      .toEqual(emptyComponentState(Immutable.fromJS({
        component: {componentKey: 'componentValue'},
        key: 'value'
      })).toJS());
  });
});

describe('removeTableFromInputTableState', function () {
  it('empty state should return empty state', function () {
    expect(removeTableFromInputTableState(Immutable.fromJS({}), 'mytable').toJS())
      .toEqual({});
  });
  it('legacy state should return legacy state', function () {
    expect(removeTableFromInputTableState(Immutable.fromJS({key: 'value'}), 'mytable').toJS())
      .toEqual({key: 'value'});
  });
  it('empty namespace state should return empty namespace state', function () {
    expect(removeTableFromInputTableState(Immutable.fromJS({storage: {input: {tables: []}}}), 'mytable').toJS())
      .toEqual({storage: {input: {tables: []}}});
  });
  it('should remove the correct table', function () {
    expect({storage: {input: {tables: [{source: 'mytable2'}]}}})
      .toEqual(removeTableFromInputTableState(Immutable.fromJS({storage: {input: {tables: [{source: 'mytable'}, {source: 'mytable2'}]}}}), 'mytable').toJS());
  });
  it('should remove the only correct table', function () {
    expect({storage: {input: {tables: []}}})
      .toEqual(removeTableFromInputTableState(Immutable.fromJS({storage: {input: {tables: [{source: 'mytable'}]}}}), 'mytable').toJS());
  });
});

