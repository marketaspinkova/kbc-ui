import React from 'react';
import contactSupport from '../../../utils/contactSupport';

export default React.createClass({

  render() {
    return (
      <div>
        <h2 style={{margin: '0 0 10px 0'}}>Welcome to Keboola Connection</h2>
        <p>You are not member of any project yet.
          Please <a href="" onClick={contactSupport}>contact us</a> to get started.
        </p>
      </div>
    );
  }
});