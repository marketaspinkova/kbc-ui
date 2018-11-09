import React from 'react';
import contactSupport from '../../../utils/contactSupport';
import InvitationsButton from './InvitationsButton';
import PromoCodeButton from './PromoCodeButton';

export default React.createClass({
  propTypes: {
    invitationsCount: React.PropTypes.number
  },

  invitationsButton() {
    if (!this.props.invitationsCount) {
      return null;
    }

    return (
      <InvitationsButton invitationsCount={this.props.invitationsCount} />
    );
  },

  render() {
    return (
      <div>
        <h2 style={{margin: '0 0 10px 0'}}>Welcome to Keboola Connection</h2>
        <p>
          You are not member of any project yet.
        </p>
        <div className="kbc-no-projects">
          {this.invitationsButton()}
          <PromoCodeButton/>
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
