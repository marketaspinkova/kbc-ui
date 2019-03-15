import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import contactSupport from '../../../../../utils/contactSupport';
import ComponentIcon from '../../../../../react/common/ComponentIcon';
import ComponentName from '../../../../../react/common/ComponentName';
import { Modal, Button, ButtonToolbar } from 'react-bootstrap';

export default createReactClass({
  propTypes: {
    component: PropTypes.object.isRequired,
    configuration: PropTypes.object.isRequired,
    onCancel: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired
  },

  render() {
    return (
      <div>
        <Modal.Header closeButton={true} onHide={this.props.onClose} className="modal-configuration-header">
          <div className="row">
            <div className="col-xs-3">
              <ComponentIcon component={this.props.component} className="modal-configuration-icon" size="64" />
            </div>
            <div className="col-xs-9">
              <h2 className="modal-configuration-title">
                <ComponentName component={this.props.component} />
              </h2>
              <p>{this.props.component.get('description')}</p>
            </div>
          </div>
        </Modal.Header>
        <Modal.Body className="modal-configuration-body">
          <p>{this._text()}</p>
        </Modal.Body>
        <Modal.Footer>
          <ButtonToolbar>
            <Button bsStyle="link" onClick={this.props.onClose}>
              Close
            </Button>
            <Button bsStyle="success" onClick={this._contactSupport}>
              Contact Support
            </Button>
          </ButtonToolbar>
        </Modal.Footer>
      </div>
    );
  },

  _text() {
    switch (this.props.component.get('type')) {
      case 'writer':
        return 'This writer has to be configured manually, please contact our support for assistance.';
      case 'extractor':
        return 'This extractor has to be configured manually, please contact our support for assistance.';
      default:
        break;
    }
  },

  _contactSupport() {
    const name = this.props.component.get('name');
    const type = this.props.component.get('type');

    return contactSupport({
      subject: `${name} ${type} configuration assistance request`,
      type: 'project'
    });
  }
});
