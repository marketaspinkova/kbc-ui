import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {fromJS} from 'immutable';
import ProfilesLoader from './ProfilesLoader';
import EmptyState from '../../components/react/components/ComponentEmptyState';
import { Panel, ListGroup, ListGroupItem } from 'react-bootstrap';

export default createReactClass({

  propTypes: {
    localStateProfiles: PropTypes.object.isRequired,
    localStatePickerData: PropTypes.object.isRequired,
    updateLocalStateProfiles: PropTypes.func.isRequired,
    updateLocalStatePickerData: PropTypes.func.isRequired,
    sendNotification: PropTypes.func.isRequired

  },

  render() {
    return this.renderProfilesSelector();
  },

  renderProfilesSelector() {
    const gaData = this.props.localStatePickerData;
    const profiles = gaData.get('profiles');
    const email = gaData.get('email');
    return (
      <div className="text-center">
        <h3>Retrieve Profiles From Google Account
        </h3>
        {this.renderProfilesPicker()}

        {profiles ?
          <span>
            <h3>Select Profiles of {email} </h3>
            {this.renderLoadedProfiles(profiles)}
          </span>
          :
          <EmptyState>
            <small>
              <p>Requires temporary authorization of a Google account after which a short-lived access token is obtained to load profiles from the selected account. </p>
              <p>Google authorization uses a pop up window, hence disable windows pop up blocking for this site in the browser settings please.</p>
            </small>
          </EmptyState>
        }
      </div>
    );
  },

  renderLoadedProfiles(profiles) {
    return (
      <div className="kbc-accordion kbc-panel-heading-with-table kbc-panel-heading-with-table'">
        { profiles && profiles.count() > 0 ?
          profiles.map((p, pname) => this.renderProfileGroup(p, pname))
          :
          <EmptyState>The account has no profiles</EmptyState>
        }
      </div>
    );
  },


  renderProfileGroup(profileGroup, profileGroupName) {
    const header = (
      <span key={profileGroupName}>
        {profileGroupName}
      </span>);

    return (
      <Panel
        header={header}
        key={profileGroupName}
        collapsible={true}
        className="profile-panel">
        {profileGroup.map((p, pname) => this.renderProfilePanel(p, pname))}
      </Panel>
    );
  },

  renderProfilePanel(profile, profileName) {
    const first = profile.first();
    const header = (
      <span key={profileName}>
        {profileName} ({first ? first.get('webPropertyId') : 'Empty'})
      </span>);
    return (
      <Panel
        header={header}
        key={profileName}
        eventKey={profileName}
        collapsible={true}>
        <div className="row">
          <ListGroup>
            {first ?
              profile.map((pItem, idx) => {
                return (
                  <ListGroupItem
                    key={idx}
                    active={this.isSelected(pItem)}
                    onClick={() => this.onProfileClick(pItem)}>
                    <div className="text-center">
                      {pItem.get('name')} ({pItem.get('id')})
                    </div>
                  </ListGroupItem>
                );
              }).toArray()
              : <ListGroupItem>No profiles found</ListGroupItem>}
          </ListGroup>
        </div>
      </Panel>
    );
  },

  onProfileClick(profile) {
    const profiles = this.props.localStateProfiles;
    if (!this.isSelected(profile)) {
      this.props.updateLocalStateProfiles(profiles.push(profile));
    } else {
      this.deselectProfile(profile.get('id'));
    }
  },

  isSelected(profile) {
    const profiles = this.props.localStateProfiles;
    return profiles.find((p) => p.get('id').toString() === profile.get('id').toString());
  },

  deselectProfile(profileId) {
    const profiles = this.props.localStateProfiles;
    const newProfiles = profiles.filter((p) => p.get('id') !== profileId);
    this.props.updateLocalStateProfiles(newProfiles);
  },

  renderProfilesPicker() {
    return (
      <ProfilesLoader
        email={null}
        onProfilesLoadError={
          (err) => {
            this.props.sendNotification({
              message: err.message,
              type: 'error'
            });
          }}
        onProfilesLoad={
          (profiles, email) => {
            const pickerData = fromJS({
              profiles: profiles,
              email: email
            });
            this.props.updateLocalStatePickerData(pickerData);
          }}
      />
    );
  }


});
