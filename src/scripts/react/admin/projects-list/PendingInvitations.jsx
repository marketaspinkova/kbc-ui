import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import { Alert } from 'react-bootstrap';

export default createReactClass({
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
      <a href="/admin/account/projects-invitations" className="no-underline">
        <Alert bsStyle="warning" className="alert-as-link">
          <strong>Pending Invitations</strong>
          <br />
          <span>
            You have <strong>{this.props.invitationsCount}</strong> pending{' '}
            <strong>invitation{this.pluralText()}</strong>
            <br /> waiting for your response.
          </span>
        </Alert>
      </a>
    );
  }
});
