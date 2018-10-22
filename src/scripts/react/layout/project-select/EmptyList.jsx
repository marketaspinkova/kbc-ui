import React from 'react';
import contactSupport from '../../../utils/contactSupport';

export default React.createClass({
  render() {
    return (
      <div>
        <h2 style={{margin: '0 0 10px 0'}}>Welcome to Keboola Connection</h2>
        <p>
          You are not member of any project yet.
          Please{' '}
          <button className="btn btn-link btn-link-inline" onClick={contactSupport}>
            contact us
          </button>
          {' '}to get started.
        </p>
      </div>
    );
  }
});
