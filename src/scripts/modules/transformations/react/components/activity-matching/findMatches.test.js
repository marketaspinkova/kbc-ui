import findMatches from './findMatches';
import { Map, OrderedMap, fromJS } from 'immutable';

const transformation = fromJS({ id: 1, input: [{ source: 'prvni' }, { source: 'druha' }] });
let data;

describe('findMatches', () => {
  it('should return empty Map when transformation has some table in IM which we have no usages data for', () => {
    data = fromJS([{ inputTable: 'prvni' }]);

    expect(findMatches(transformation, data)).toEqual(Map());
  });

  it('should return empty OrderedMap when no relevant matches is found', () => {
    data = fromJS([
      {
        inputTable: 'prvni',
        usedIn: [{ rowId: 1, lastRunAt: '2017-02-13T12:01:05+0100', lastRunStatus: 'success' }]
      },
      {
        inputTable: 'druha',
        usedIn: [{ rowId: 1, lastRunAt: '2017-02-13T12:01:05+0100', lastRunStatus: 'success' }]
      }
    ]);

    expect(findMatches(transformation, data)).toEqual(OrderedMap());
  });

  it('should return OrderedMap with relevant matches transformations', () => {
    data = fromJS([
      {
        inputTable: 'prvni',
        usedIn: [
          { rowId: 1, lastRunAt: '2017-02-13T12:01:05+0100', lastRunStatus: 'success' },
          { rowId: 2, lastRunAt: '2018-02-13T12:01:05+0100', lastRunStatus: 'success' },
          { rowId: 3, lastRunAt: '2019-02-13T12:01:05+0100', lastRunStatus: 'success' }
        ]
      },
      {
        inputTable: 'druha',
        usedIn: [
          { rowId: 1, lastRunAt: '2017-02-13T12:01:05+0100', lastRunStatus: 'success' },
          { rowId: 2, lastRunAt: '2018-02-13T12:01:05+0100', lastRunStatus: 'success' },
          { rowId: 4, lastRunAt: '2019-02-13T12:01:05+0100', lastRunStatus: 'success' }
        ]
      }
    ]);

    expect(findMatches(transformation, data).count()).toEqual(1);
  });

  it('should return OrderedMap with relevant matches sorted by most recent successful run', () => {
    data = fromJS([
      {
        inputTable: 'prvni',
        usedIn: [
          { rowId: 1, lastRunAt: '2017-02-13T12:01:05+0100', lastRunStatus: 'success' },
          { rowId: 2, lastRunAt: '2018-02-13T12:01:05+0100', lastRunStatus: 'success' },
          { rowId: 3, lastRunAt: '2019-02-13T12:01:05+0100', lastRunStatus: 'success' }
        ]
      },
      {
        inputTable: 'druha',
        usedIn: [
          { rowId: 1, lastRunAt: '2017-02-13T12:01:05+0100', lastRunStatus: 'success' },
          { rowId: 2, lastRunAt: '2018-02-13T12:01:05+0100', lastRunStatus: 'success' },
          { rowId: 3, lastRunAt: '2019-02-13T12:01:05+0100', lastRunStatus: 'success' },
          { rowId: 4, lastRunAt: '2019-02-12T12:01:05+0100', lastRunStatus: 'success' }
        ]
      }
    ]);

    expect(findMatches(transformation, data).count()).toEqual(2);
    expect(findMatches(transformation, data).first().first().get('rowId')).toEqual(3);
    expect(findMatches(transformation, data).last().first().get('rowId')).toEqual(2);
  });

  it('should filter out never runned transformations', () => {
    data = fromJS([
      {
        inputTable: 'prvni',
        usedIn: [
          { rowId: 1, lastRunAt: '2017-02-13T12:01:05+0100', lastRunStatus: 'success' },
          { rowId: 2, lastRunAt: '2018-02-13T12:01:05+0100', lastRunStatus: 'success' },
          { rowId: 3 }
        ]
      },
      {
        inputTable: 'druha',
        usedIn: [
          { rowId: 1, lastRunAt: '2017-02-13T12:01:05+0100', lastRunStatus: 'success' },
          { rowId: 2, lastRunAt: '2018-02-13T12:01:05+0100', lastRunStatus: 'success' },
          { rowId: 3 }
        ]
      }
    ]);

    expect(findMatches(transformation, data).count()).toEqual(1);
    expect(findMatches(transformation, data).first().first().get('rowId')).toEqual(2);
  });
});
