import assert from 'assert';
import Immutable from 'immutable';
import {getConflicts} from './detect';

const t1 = {
  'output': [
    {
      'destination': 'out.c-duplicite-output-mapping.test',
      'source': 'test'
    },
    {
      'destination': 'out.c-duplicite-output-mapping.test2',
      'source': 'test2'
    },
    {
      'destination': 'out.c-duplicite-output-mapping.different_source',
      'source': 'different_source'
    }
  ],
  'queries': [''],
  'input': [],
  'name': 'T1',
  'packages': [],
  'requires': [],
  'backend': 'snowflake',
  'queriesString': '',
  'type': 'simple',
  'id': '1',
  'phase': 1,
  'disabled': false,
  'description': ''
};

const t2 = {
  'output': [
    {
      'destination': 'out.c-duplicite-output-mapping.test',
      'source': 'test'
    },
    {
      'destination': 'out.c-duplicite-output-mapping.test2',
      'source': 'test2'
    },
    {
      'destination': 'out.c-duplicite-output-mapping.different_source',
      'source': 'different_source'
    }
  ],
  'queries': [''],
  'input': [],
  'name': 'T2',
  'packages': [],
  'requires': [],
  'backend': 'snowflake',
  'queriesString': '',
  'type': 'simple',
  'id': '2',
  'phase': 2,
  'disabled': false,
  'description': ''
};

const t1a = {
  'output': [
    {
      'destination': 'out.c-duplicite-output-mapping.test',
      'source': 'test'
    },
    {
      'destination': 'out.c-duplicite-output-mapping.different_source',
      'source': 'yet_another_different_source'
    }
  ],
  'queries': [''],
  'input': [],
  'name': 'T1a',
  'packages': [],
  'requires': [],
  'backend': 'snowflake',
  'queriesString': '',
  'type': 'simple',
  'id': '1a',
  'phase': 1,
  'disabled': false,
  'description': ''
};

const t1b = {
  'output': [
    {
      'destination': 'out.c-duplicite-output-mapping.no_conflict',
      'source': 'no_conflict'
    }
  ],
  'queries': [''],
  'input': [],
  'name': 'T1b',
  'packages': [],
  'requires': [],
  'backend': 'snowflake',
  'queriesString': '',
  'type': 'simple',
  'id': '1b',
  'phase': 1,
  'disabled': false,
  'description': ''
};

describe('getConflicts', () => {
  it('should return empty array for a single transformation', () => {
    assert.deepEqual([], getConflicts(Immutable.fromJS(t1), Immutable.fromJS({'1': t1})).toJS());
  });
  it('should return empty array for conflict in different phases', () => {
    assert.deepEqual([], getConflicts(Immutable.fromJS(t1), Immutable.fromJS({'1': t1, '2': t2})).toJS());
  });
  it('should return conflicting transformations', () => {
    assert.deepEqual([
      {
        'id': '1a',
        'destination': 'out.c-duplicite-output-mapping.test'
      },
      {
        'id': '1a',
        'destination': 'out.c-duplicite-output-mapping.different_source'
      }
    ], getConflicts(Immutable.fromJS(t1), Immutable.fromJS({'1': t1, '1a': t1a, '1b': t1b})).toJS());
    assert.deepEqual([
      {
        'id': '1',
        'destination': 'out.c-duplicite-output-mapping.test'
      },
      {
        'id': '1',
        'destination': 'out.c-duplicite-output-mapping.different_source'
      }
    ], getConflicts(Immutable.fromJS(t1a), Immutable.fromJS({'1': t1, '1a': t1a, '1b': t1b})).toJS());
  });
  it('should return empty array for no conflicts', () => {
    assert.deepEqual([], getConflicts(Immutable.fromJS(t1), Immutable.fromJS({'1': t1, '1b': t1b})).toJS());
    assert.deepEqual([], getConflicts(Immutable.fromJS(t1a), Immutable.fromJS({'1a': t1a, '1b': t1b})).toJS());
  });
});
