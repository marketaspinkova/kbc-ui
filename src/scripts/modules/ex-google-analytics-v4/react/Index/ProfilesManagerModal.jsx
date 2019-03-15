import PropTypes from 'prop-types';
import React from 'react';
import {List, Map} from 'immutable';
import {Modal} from 'react-bootstrap';
import ProfileInfo from '../ProfileInfo';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';

import ProfilesPicker from '../../../google-utils/react/ProfilesPicker';
import ApplicationActionCreators from '../../../../actions/ApplicationActionCreators';
import EmptyState from '../../../components/react/components/ComponentEmptyState';

export default React.createClass({

  propTypes: {
    profiles: PropTypes.object.isRequired,
    show: PropTypes.bool.isRequired,
    isSaving: PropTypes.bool.isRequired,
    onHideFn: PropTypes.func,
    authorizedEmail: PropTypes.string,
    localState: PropTypes.object.isRequired,
    updateLocalState: PropTypes.func.isRequired,
    prepareLocalState: PropTypes.func.isRequired,
    onSaveProfiles: PropTypes.func.isRequired
  },

  render() {
    return (
      <Modal
        bsSize="large"
        show={this.props.show}
        onHide={this.props.onHideFn}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Setup Profiles
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="table kbc-table-border-vertical kbc-detail-table" style={{borderBottom: 0}}>
              <div className="tr">
                <div className="td">
                  {this.renderProfilesSelector()}
                </div>
                <div className="td">
                  {this.renderProjectProfiles()}
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <ConfirmButtons
            isSaving={this.props.isSaving}
            onSave={this.handleSave}
            onCancel={this.props.onHideFn}
            saveLabel="Save Changes"
            isDisabled={!this.isProfilesChanged()}
          />

        </Modal.Footer>
      </Modal>
    );
  },

  renderProfilesSelector() {
    return (
      <ProfilesPicker
        localStateProfiles={this.getLocalProfiles()}
        localStatePickerData={this.getLocalStatePickerData()}
        updateLocalStateProfiles={this.updateLocalStateProfiles}
        updateLocalStatePickerData={(newData) => this.props.updateLocalState('gaPickerData', newData)}
        sendNotification={(msg) => ApplicationActionCreators.sendNotification(msg)}
      />
    );
  },

  handleSave() {
    this.props.onSaveProfiles(this.getLocalProfiles()).then(
      () => this.props.onHideFn()
    );
  },

  isProfilesChanged() {
    const oldSet = this.props.profiles.map((p) => (p.get('id').toString())).toSet();
    const newSet = this.getLocalProfiles().map((p) => (p.get('id').toString())).toSet();
    return oldSet.hashCode() !== newSet.hashCode();
  },

  renderProjectProfiles() {
    const profiles = this.getLocalProfiles();
    return (
      <div>
        <h3> Review Selected Profiles To Extract Data From {this.props.authorizedEmail ? this.props.authorizedEmail : 'n/a'}</h3>

        {profiles.count() > 0 ?
          <ul>
            {profiles.map((profile, index) => {
              return (
                <li key={index}>
                  <ProfileInfo profile={profile} />
                  <span onClick={() => this.deselectProfile(profile.get('id'))} className="kbc-icon-cup kbc-cursor-pointer" />
                </li>
              );
            })}
          </ul>
          :
          <EmptyState>
           No profiles selected.
          </EmptyState>
        }
      </div>
    );
  },

  deselectProfile(profileId) {
    const profiles = this.getLocalProfiles();
    const newProfiles = profiles.filter((p) => p.get('id') !== profileId);
    this.updateLocalStateProfiles(newProfiles);
  },

  updateLocalStateProfiles(newProfiles) {
    this.props.updateLocalState('profiles', newProfiles);
  },

  getLocalProfiles() {
    return this.props.localState.get('profiles', List());
  },

  getLocalStatePickerData() {
    return this.props.localState.get('gaPickerData', Map());
  }

});
