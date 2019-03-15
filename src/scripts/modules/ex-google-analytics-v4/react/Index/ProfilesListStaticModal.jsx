import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import ProfileInfo from '../ProfileInfo';

export default React.createClass({

  propTypes: {
    profiles: PropTypes.object.isRequired,
    show: PropTypes.bool.isRequired,
    onHideFn: PropTypes.func
  },

  render() {
    return (
      <Modal
        show={this.props.show}
        onHide={this.props.onHideFn}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Profiles
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.renderProfiles()}
        </Modal.Body>
      </Modal>
    );
  },

  renderProfiles() {
    return (
      <div>
        {this.props.profiles.map((profile, index) => <ProfileInfo key={index} profile={profile} />)}
      </div>
    );
  }
});
