import PropTypes from 'prop-types';
import React from 'react';

export default React.createClass({

  propTypes: {
    invitationsCount: PropTypes.number.isRequired
  },

  pluralText() {
    return this.props.invitationsCount > 1 ? 's' : null;
  },

  render() {
    if (!this.props.invitationsCount) {
      return null;
    }

    return (
      <a
        href="/admin/account/projects-invitations"
        className="btn btn-lg btn-block btn-warning text-left action-button"
      >
        <span className="raquo">&raquo;</span>
        <strong className="h2">Pending Invitations</strong><br/>
        <span className="small">
          You have <strong>{this.props.invitationsCount}</strong> pending
          {' '}<strong>invitation{this.pluralText()}</strong><br/>
          {' '}waiting for your response.
        </span>
      </a>
    );
  }
});
