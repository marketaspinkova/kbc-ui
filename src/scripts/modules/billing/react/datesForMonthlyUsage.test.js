import { compute } from './datesForMonthlyUsage';
import moment from 'moment';

describe('computeDatesForMonthlyUsage', function() {
  describe('#computeDatesForMonthlyUsage()', function() {
    it('it should return previous day for both dates', function() {
      expect(compute(
        moment('2017-01-01'), // computation start
        moment('2017-05-17'), // now
        moment('2017-05-17') // projectCreation
      )).toEqual({
        dateFrom: '2017-05-16',
        dateTo: '2017-05-16'
      });
    });

    it('it should return computation start date and previous day', function() {
      expect(compute(
        moment('2017-01-01'), // computation start
        moment('2017-05-17'), // now
        moment(null) // projectCreation not set
      )).toEqual({
        dateFrom: '2017-01-01',
        dateTo: '2017-05-16'
      });
    });

    it('it should return computation start date and previous day', function() {
      expect(compute(
        moment('2017-01-01'), // computation start
        moment('2017-05-17'), // now
        moment('2016-08-01') // projectCreation before computation
      )).toEqual({
        dateFrom: '2017-01-01',
        dateTo: '2017-05-16'
      });
    });

    it('it should return previous day for both dates', function() {
      expect(compute(
        moment('2017-01-01'), // computation start
        moment('2017-05-17'), // now
        moment('2017-05-30') // projectCreation in future
      )).toEqual({
        dateFrom: '2017-05-16',
        dateTo: '2017-05-16'
      });
    });
  });
});
