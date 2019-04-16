import Immutable from 'immutable';
import {
  emptyComponentState,
  isEmptyComponentState,
  removeTableFromInputTableState,
  constants
} from './configurationState';

describe('isEmptyComponentState', function () {
  it('empty legacy state should return true', function () {
    expect(true).toEqual(isEmptyComponentState(Immutable.fromJS({})));
  });
  it('nonempty legacy state should return false', function () {
    expect(false).toEqual(isEmptyComponentState(Immutable.fromJS({key: 'value'})));
  });
  it('empty namespace state should return true', function () {
    expect(true).toEqual(
      isEmptyComponentState(Immutable.fromJS({[constants.COMPONENT_NAMESPACE]: {}}))
    );
  });
  it('empty namespace state with a sibling should return true', function () {
    expect(true).toEqual(
      isEmptyComponentState(Immutable.fromJS({[constants.COMPONENT_NAMESPACE]: {}, key: 'value'}))
    );
  });
  it('nonempty namespace state should return false', function () {
    expect(false).toEqual(
      isEmptyComponentState(Immutable.fromJS({[constants.COMPONENT_NAMESPACE]: {key: 'value'}}))
    );
  });
});

describe('emptyComponentState', function () {
  it('empty legacy state should return empty namespace state', function () {
    expect({[constants.COMPONENT_NAMESPACE]: {}}).toEqual(
      emptyComponentState(Immutable.fromJS({})).toJS()
    );
  });
  it('nonempty legacy state should return empty namespace state with the rest untouched', function () {
    expect({key: 'value', [constants.COMPONENT_NAMESPACE]: {}}).toEqual(
      emptyComponentState(Immutable.fromJS({key: 'value', [constants.COMPONENT_NAMESPACE]: {}})).toJS()
    );
  });
  it('empty namespace state should return empty namespace state', function () {
    expect({[constants.COMPONENT_NAMESPACE]: {}}).toEqual(
      emptyComponentState(Immutable.fromJS({[constants.COMPONENT_NAMESPACE]: {}})).toJS()
    );
  });
  it('empty namespace state with a sibling should keep the sibling', function () {
    expect({[constants.COMPONENT_NAMESPACE]: {}, key: 'value'}).toEqual(
      emptyComponentState(
        Immutable.fromJS({[constants.COMPONENT_NAMESPACE]: {}, key: 'value'})
      ).toJS()
    );
  });
  it('nonempty namespace state should return empty namespace state', function () {
    expect({[constants.COMPONENT_NAMESPACE]: {}}).toEqual(
      emptyComponentState(
        Immutable.fromJS({[constants.COMPONENT_NAMESPACE]: {key: 'value'}})
      ).toJS()
    );
  });
  it('nonempty namespace state with a sibling should keep the sibling end empty the namespace', function () {
    expect({[constants.COMPONENT_NAMESPACE]: {}, key: 'value'}).toEqual(
      emptyComponentState(
        Immutable.fromJS({
          [constants.COMPONENT_NAMESPACE]: {componentKey: 'componentValue'},
          key: 'value'
        })
      ).toJS()
    );
  });
});

describe('removeTableFromInputTableState', function () {
  it('empty state should return empty state', function () {
    expect(removeTableFromInputTableState(Immutable.fromJS({}), 'mytable').toJS()).toEqual({});
  });
  it('legacy state should return legacy state', function () {
    expect(
      removeTableFromInputTableState(Immutable.fromJS({key: 'value'}), 'mytable').toJS()
    ).toEqual({key: 'value'});
  });
  it('empty namespace state should return empty namespace state', function () {
    expect(
      removeTableFromInputTableState(
        Immutable.fromJS({
          [constants.STORAGE_NAMESPACE]: {
            [constants.INPUT_NAMESPACE]: {[constants.TABLES_NAMESPACE]: []}
          }
        }),
        'mytable'
      ).toJS()
    ).toEqual({storage: {input: {tables: []}}});
  });
  it('should remove the correct table', function () {
    expect({
      [constants.STORAGE_NAMESPACE]: {
        [constants.INPUT_NAMESPACE]: {[constants.TABLES_NAMESPACE]: [{source: 'mytable2'}]}
      }
    }).toEqual(
      removeTableFromInputTableState(
        Immutable.fromJS({
          [constants.STORAGE_NAMESPACE]: {
            [constants.INPUT_NAMESPACE]: {
              [constants.TABLES_NAMESPACE]: [{source: 'mytable'}, {source: 'mytable2'}]
            }
          }
        }),
        'mytable'
      ).toJS()
    );
  });
  it('should remove the only correct table', function () {
    expect({
      [constants.STORAGE_NAMESPACE]: {
        [constants.INPUT_NAMESPACE]: {[constants.TABLES_NAMESPACE]: []}
      }
    }).toEqual(
      removeTableFromInputTableState(
        Immutable.fromJS({
          [constants.STORAGE_NAMESPACE]: {
            [constants.INPUT_NAMESPACE]: {
              [constants.TABLES_NAMESPACE]: [{source: 'mytable'}]
            }
          }
        }),
        'mytable'
      ).toJS()
    );
  });
});
