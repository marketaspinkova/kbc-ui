import React from 'react';
import {Modal} from 'react-bootstrap';
import moment from 'moment';
import {ConfirmButtons} from '@keboola/indigo-ui';

export default React.createClass({

  propTypes: {
    version: React.PropTypes.object.isRequired,
    show: React.PropTypes.bool.isRequired,
    onClose: React.PropTypes.func.isRequired,
    onRollback: React.PropTypes.func.isRequired
  },

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Version Rollback</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to rollback version #{this.props.version.get('version')} created {moment(this.props.version.get('created')).fromNow()} by {this.props.version.getIn(['creatorToken', 'description'], 'unknown')}?
          </p>
          <p>
            Rollback copies the older version into a new version, so no versions will be lost.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <ConfirmButtons
            isSaving={false}
            isDisabled={false}
            cancelLabel="Cancel"
            saveLabel="Rollback"
            saveStyle="danger"
            onCancel={this.props.onClose}
            onSave={this.props.onRollback}
            showSave={true}
          />
        </Modal.Footer>
      </Modal>
    );
  }
});
