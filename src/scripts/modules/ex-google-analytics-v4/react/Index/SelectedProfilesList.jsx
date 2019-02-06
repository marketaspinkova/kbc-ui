import React, {PropTypes} from 'react';
import ProfileInfo from '../ProfileInfo';

export default React.createClass({
  propTypes: {
    allProfiles: PropTypes.object.isRequired,
    profileIds: PropTypes.array
  },

  getProfile(profileId) {
    return this.props.allProfiles.find((p) => p.get('id').toString() === profileId.toString());
  },

  render() {
    if (!this.props.profileIds) {
      return <span>--all profiles--</span>;
    }

    return (
      <span>
        {this.props.profileIds.map((profileId) => this.renderProfile(profileId))}
      </span>
    );
  },

  renderProfile(profileId) {
    const profile = this.getProfile(profileId);

    if (!profile) {
      return (
        <span key={profileId}>
          Unknown Profile({profileId})
        </span>
      );
    }

    return (
      <small key={profileId}>
        <ProfileInfo profile={profile} />
      </small>
    );
  }
});
