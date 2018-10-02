import React from 'react';

export default React.createClass({
  propTypes: {
    emails: React.PropTypes.object.isRequired
  },

  render() {
    if (this.props.emails.count()) {
      return (
        <div>
          <strong>{'Subscribers: '}</strong>
          <span>
            {this.props.emails.map(email => <span key={email.get('email')}>{email.get('email')} </span>).toArray()}
          </span>
        </div>
      );
    } else {
      return <span>No subsribers yet.</span>;
    }
  }
});
