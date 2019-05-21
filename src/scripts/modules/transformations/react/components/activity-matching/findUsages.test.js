import findUsages from './findUsages';
import { fromJS } from 'immutable';

const transformation = fromJS({ id: 1, input: [{ source: 'prvni' }, { source: 'druha' }] });
let data;

describe('findUsages', () => {
  it('should return usages for tables from transformation IM', () => {
    data = fromJS([
      {
        inputTable: 'prvni',
        usedIn: [
          {
            rowId: 1,
            lastRunAt: '2017-02-13T12:01:05+0100',
            lastRunStatus: 'success',
            configurationName: 'Bucket',
            rowName: 'Transformation'
          }
        ]
      },
      {
        inputTable: 'druha',
        usedIn: [
          {
            rowId: 1,
            lastRunAt: '2017-02-13T12:01:05+0100',
            lastRunStatus: 'success',
            configurationName: 'Bucket',
            rowName: 'Transformation'
          }
        ]
      },
      {
        inputTable: 'treti',
        usedIn: [
          {
            rowId: 1,
            lastRunAt: '2017-02-13T12:01:05+0100',
            lastRunStatus: 'success',
            configurationName: 'Bucket',
            rowName: 'Transformation'
          }
        ]
      }
    ]);

    expect(findUsages(transformation, data).count()).toEqual(2);
  });
});
