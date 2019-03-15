import React from 'react';
import Immutable from 'immutable';
import LimitsOverQuota from './LimitsOverQuota';

describe('<LimitsOverQuota />', function() {
  it('should render nothing for no limits', function() {
    const limits = Immutable.List();
    shallowSnapshot(<LimitsOverQuota limits={limits} />);
  });

  it('should render limits', function() {
    const limits = Immutable.fromJS([
      {
        unit: 'bytes',
        metricValue: 12884901888, // 12GB
        limitValue: 107374182400,
        section: 'Section 1',
        name: 'My Limit 1'
      },
      {
        metricValue: 1100,
        limitValue: 15000,
        section: 'Section 2',
        name: 'My Limit 2'
      }
    ]);

    shallowSnapshot(<LimitsOverQuota limits={limits} />);
  });

  it('should render one limit', function() {
    const limits = Immutable.fromJS([
      {
        unit: 'bytes',
        metricValue: 12884901888, // 12GB
        limitValue: 107374182400,
        section: 'Section 1',
        name: 'My Limit 1'
      }
    ]);

    shallowSnapshot(<LimitsOverQuota limits={limits} />);
  });
});
