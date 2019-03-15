import React from 'react';

import createReactClass from 'create-react-class';

export default createReactClass({
  render() {
    return (
      <a href="/admin/account/promo-codes" className="btn btn-lg btn-block btn-success text-left action-button">
        <span className="raquo">&raquo;</span>
        <strong className="h2">Enter promo code</strong><br/>
        <span className="small">
          Select this option if you have a promo code.<br/>
          A new project will be created automatically.<br/>
        </span>
      </a>
    );
  }
});
