import Immutable from 'immutable';
import { getConflictsForTransformation, getConflictsForBucket }  from './detect';

const t1 = Immutable.fromJS({
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
});

const t2 = Immutable.fromJS({
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
});

const t1a = Immutable.fromJS({
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
});

const t1b = Immutable.fromJS({
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
});

const t3 = Immutable.fromJS({
  'output': [
    {
      'destination': 'out.c-duplicite-output-mapping.conflict',
      'source': 'conflict'
    },
    {
      'destination': 'out.c-duplicite-output-mapping.conflict',
      'source': 'conflict2'
    },
    {
      'destination': 'out.c-duplicite-output-mapping.conflict',
      'source': 'conflict'
    }
  ],
  'queries': [''],
  'input': [],
  'name': 'T3',
  'packages': [],
  'requires': [],
  'backend': 'snowflake',
  'queriesString': '',
  'type': 'simple',
  'id': '3',
  'phase': 1,
  'disabled': false,
  'description': ''
});

describe('getConflictsForTransformation', () => {
  it('should return empty array for a single transformation', () => {
    expect([]).toEqual(getConflictsForTransformation(t1, Immutable.fromJS({'1': t1})).toJS());
  });
  it('should return empty array for conflict in different phases', () => {
    expect([]).toEqual(getConflictsForTransformation(t1, Immutable.fromJS({'1': t1, '2': t2})).toJS());
  });
  it('should return conflicting transformations', () => {
    expect([
      {
        'id': '1a',
        'destination': 'out.c-duplicite-output-mapping.test'
      },
      {
        'id': '1a',
        'destination': 'out.c-duplicite-output-mapping.different_source'
      }
    ]).toEqual(getConflictsForTransformation(t1, Immutable.fromJS({'1': t1, '1a': t1a, '1b': t1b})).toJS());
    expect([
      {
        'id': '1',
        'destination': 'out.c-duplicite-output-mapping.test'
      },
      {
        'id': '1',
        'destination': 'out.c-duplicite-output-mapping.different_source'
      }
    ]).toEqual(getConflictsForTransformation(t1a, Immutable.fromJS({'1': t1, '1a': t1a, '1b': t1b})).toJS());
  });
  it('should return empty array for no conflicts', () => {
    expect([]).toEqual(getConflictsForTransformation(t1, Immutable.fromJS({'1': t1, '1b': t1b})).toJS());
    expect([]).toEqual(getConflictsForTransformation(t1a, Immutable.fromJS({'1a': t1a, '1b': t1b})).toJS());
  });
  it('should detect self conflicts', () => {
    expect([
      {
        'id': '3',
        'destination': 'out.c-duplicite-output-mapping.conflict'
      }
    ]).toEqual(getConflictsForTransformation(t3, Immutable.fromJS({'3': t3})).toJS());
  });
  it('should ignore different phase variable types', () => {
    const t1PhaseAsString = t1.set('phase', '1');
    expect([
      {
        'id': '1a',
        'destination': 'out.c-duplicite-output-mapping.test'
      },
      {
        'id': '1a',
        'destination': 'out.c-duplicite-output-mapping.different_source'
      }
    ]).toEqual(getConflictsForTransformation(t1PhaseAsString, Immutable.fromJS({'1': t1PhaseAsString, '1a': t1a})).toJS());
  });

});

describe('getConflictsForBucket', () => {
  it('should return empty array for a single transformation', () => {
    expect([]).toEqual(getConflictsForBucket(Immutable.fromJS({'1': t1})).toJS());
  });
  it('should return empty array for conflict in different phases', () => {
    expect([]).toEqual(getConflictsForBucket(Immutable.fromJS({'1': t1, '2': t2})).toJS());
  });
  it('should return conflicting transformations', () => {
    expect([
      {
        'id': '1a',
        'destination': 'out.c-duplicite-output-mapping.test'
      },
      {
        'id': '1a',
        'destination': 'out.c-duplicite-output-mapping.different_source'
      },
      {
        'id': '1',
        'destination': 'out.c-duplicite-output-mapping.test'
      },
      {
        'id': '1',
        'destination': 'out.c-duplicite-output-mapping.different_source'
      }
    ]).toEqual(getConflictsForBucket(Immutable.fromJS({'1': t1, '1a': t1a, '1b': t1b})).toJS());
  });
  it('should return empty array for no conflicts', () => {
    expect([]).toEqual(getConflictsForBucket(Immutable.fromJS({'1': t1, '1b': t1b})).toJS());
    expect([]).toEqual(getConflictsForBucket(Immutable.fromJS({'1a': t1a, '1b': t1b})).toJS());
  });
  it('should detect self conflicts', () => {
    expect([
      {
        'id': '3',
        'destination': 'out.c-duplicite-output-mapping.conflict'
      }
    ]).toEqual(getConflictsForBucket(Immutable.fromJS({'3': t3})).toJS());
  });
});