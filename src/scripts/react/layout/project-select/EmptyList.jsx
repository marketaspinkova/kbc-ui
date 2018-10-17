import React from 'react';
import contactSupport from '../../../utils/contactSupport';
import {Button} from 'react-bootstrap';

export default React.createClass({

  render() {
    return (
      <div>
        <h2 style={{margin: '0 0 10px 0'}}>Welcome to Keboola Connection</h2>
        <p>You are not member of any project yet.
          Please contact us to get started.
        </p>
        <Button block bsStyle="primary" onClick={contactSupport}>
          Contact Support
        </Button>
      </div>
    );
  }
});