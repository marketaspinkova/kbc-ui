import PropTypes from 'prop-types';
import React from 'react';

import createReactClass from 'create-react-class';

export default createReactClass({
  propTypes: {
    profile: PropTypes.object.isRequired
  },

  render() {
    const profile = this.props.profile;
    return (
      <span>
        {profile.get('accountName')} / {profile.get('webPropertyName')} / {profile.get('name')} ({profile.get('id')})
      </span>);
  }
});
