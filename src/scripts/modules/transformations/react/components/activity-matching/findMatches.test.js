import findMatches from './findMatches';
import { Map, OrderedMap, fromJS } from 'immutable';

const transformation = fromJS({ id: 1, input: [{ source: 'prvni' }, { source: 'druha' }] });
let data;

describe('findMatches', () => {
  it('should return empty Map when transformation has some table in IM which we have no usages data for', () => {
    data = fromJS([{ inputTable: 'prvni' }]);

    expect(Map()).toEqual(findMatches(transformation, data));
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

    expect(OrderedMap()).toEqual(findMatches(transformation, data));
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

    expect(1).toEqual(findMatches(transformation, data).count());
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

    expect(2).toEqual(findMatches(transformation, data).count());
    expect(3).toEqual(findMatches(transformation, data).first().first().get('rowId'));
    expect(2).toEqual(findMatches(transformation, data).last().first().get('rowId'));
  });

  it('should return OrderedMap limited by setted limit', () => {
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
          { rowId: 3, lastRunAt: '2019-02-13T12:01:05+0100', lastRunStatus: 'success' }
        ]
      }
    ]);

    expect(1).toEqual(findMatches(transformation, data, 1).count());
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

    expect(1).toEqual(findMatches(transformation, data).count());
    expect(2).toEqual(findMatches(transformation, data).first().first().get('rowId'));
  });
});
