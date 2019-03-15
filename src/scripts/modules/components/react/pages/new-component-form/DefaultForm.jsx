import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import ComponentIcon from '../../../../../react/common/ComponentIcon';
import ComponentName from '../../../../../react/common/ComponentName';
import AppVendorInfo from './AppVendorInfo';
import { Modal, ButtonToolbar, Button, ControlLabel, FormControl, FormGroup, Col } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';

export default createReactClass({
  propTypes: {
    component: PropTypes.object.isRequired,
    configuration: PropTypes.object.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    isValid: PropTypes.bool.isRequired,
    isSaving: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
  },

  _handleChange(propName, event) {
    this.props.onChange(this.props.configuration.set(propName, event.target.value));
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
          <form className="form-horizontal" onSubmit={this._handleSubmit}>
            <FormGroup>
              <Col componentClass={ControlLabel} xs={3}>Name</Col>
              <Col xs={9}>
                <FormControl
                  type="text"
                  autoFocus
                  value={this.props.configuration.get('name')}
                  placeholder={`My ${this.props.component.get('name')} ${this.props.component.get('type')}`}
                  onChange={this._handleChange.bind(this, 'name')}
                  disabled={this.props.isSaving}
                />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col componentClass={ControlLabel} xs={3}>Description</Col>
              <Col xs={9}>
                <FormControl
                  componentClass="textarea"
                  value={this.props.configuration.get('description')}
                  onChange={this._handleChange.bind(this, 'description')}
                  disabled={this.props.isSaving}
                />
              </Col>
            </FormGroup>
            {this._is3rdPartyApp() && this._renderAppVendorInfo()}
          </form>
        </Modal.Body>
        <Modal.Footer>
          <ButtonToolbar>
            {this.props.isSaving && (
              <span>
                <Loader />{' '}
              </span>
            )}
            <Button bsStyle="link" disabled={this.props.isSaving} onClick={this.props.onCancel}>
              Cancel
            </Button>
            <Button
              bsStyle="success"
              disabled={!(this.props.isValid && this._isLicenseAgreed()) || this.props.isSaving}
              onClick={this.props.onSave}
            >
              Create Configuration
            </Button>
          </ButtonToolbar>
        </Modal.Footer>
      </div>
    );
  },

  _renderAppVendorInfo() {
    return (
      <AppVendorInfo
        component={this.props.component}
        licenseAgreed={this._isLicenseAgreed()}
        handleAgreedLicense={this._setAgreedLicense}
      />
    );
  },

  _is3rdPartyApp() {
    return this.props.component.get('flags').contains('3rdParty');
  },

  _isLicenseAgreed() {
    // if is not 3rdparty app then license is always agreed by default
    if (!this._is3rdPartyApp()) {
      return true;
    }

    return this.props.configuration.get('agreed') || false;
  },

  _setAgreedLicense(checked) {
    this.props.onChange(this.props.configuration.set('agreed', checked));
  },

  _handleSubmit(e) {
    e.preventDefault();
    if (this.props.isValid && this._isLicenseAgreed()) {
      return this.props.onSave();
    }
  }
});
