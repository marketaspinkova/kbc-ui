import React from 'react';
import createReactClass from 'create-react-class';
import Expiration from './Expiration';

describe('<Expiration />', function() {
  it('should render nothing when expiration is in long time', function() {
    const expires = new Date(Date.now() + (60 * 24 * 60 * 60 * 1000)).toISOString(); // in 60 days
    shallowSnapshot(<Expiration expires={expires} />);
  });

  it('should render expiration warning when expiration is close', function() {
    const expires = new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString(); // next day
    shallowSnapshot(<Expiration expires={expires} />);
  });
});