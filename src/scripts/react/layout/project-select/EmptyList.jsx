import React from 'react';
import contactSupport from '../../../utils/contactSupport';

export default React.createClass({
  render() {
    return (
      <div>
        <h2 style={{margin: '0 0 10px 0'}}>Welcome to Keboola Connection</h2>
        <p>
          You are not member of any project yet.
        </p>
        <div className="kbc-no-projects">
          <a href="/admin/account/promo-codes" className="btn btn-lg btn-block btn-success text-left action-button">
            <span className="raquo">&raquo;</span>
            <strong className="h2">Enter promo code</strong><br/>
            <span className="small">
              Select this option if you have a promo code.<br/>
              A new project will be created automatically.<br/>
            </span>
          </a>
        </div>
        <hr />
        <p className="text-center">
          Or{' '}
          <button className="btn btn-link btn-link-inline" onClick={contactSupport}>
            contact us
          </button>
          {' '}to get started.
        </p>
      </div>
    );
  }
});
