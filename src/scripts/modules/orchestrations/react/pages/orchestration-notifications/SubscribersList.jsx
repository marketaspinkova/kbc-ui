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
            {this.props.emails
              .map(email => {
                return <span key={email.get('email')}>{email.get('email')}</span>;
              })
              .toArray()
              .reduce((prev, curr) => [prev, ', ', curr])}
          </span>
        </div>
      );
    } else {
      return <span>No subscribers yet.</span>;
    }
  }
});
