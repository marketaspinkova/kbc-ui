import PropTypes from 'prop-types';
import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {Modal, FormControl, FormGroup, ControlLabel, Form, Col} from 'react-bootstrap';
import { ExternalLink } from '@keboola/indigo-ui';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';

export default React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    onHide: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
    isSaving: PropTypes.bool.isRequired,
    localState: PropTypes.object.isRequired,
    onSave: PropTypes.func.isRequired,
    updateLocalState: PropTypes.func.isRequired,
    prepareLocalState: PropTypes.func.isRequired,
    currentVersion: PropTypes.string.isRequired,
    defaultVersion: PropTypes.string.isRequired
  },

  isValid() {
    return !!this.getVersion();
  },

  render() {
    const value = this.getVersion();

    return (
      <Modal
        show={this.props.show}
        onHide={this.props.onHide}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Set Facebook API Version
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Facebook has its own specific platform {' '}
            <ExternalLink href="https://developers.facebook.com/docs/apps/versions">versioning</ExternalLink>.
            If you change the API version, some API calls specified in queries may not work, producing an error,
            or no data or data with different columns might be retrieved. To review the API changes,
            see <ExternalLink href="https://developers.facebook.com/docs/apps/changelog">changelog</ExternalLink>.
            The most recent API version is {this.props.defaultVersion}.
          </p>
          <Form
            horizontal
            onSubmit={(e) => {
              e.preventDefault();
              this.handleSave();
            }}
          >
            <FormGroup
              controlId="facebook-api-version"
            >
              <Col componentClass={ControlLabel} sm={3}>
                Api Version
              </Col>
              <Col sm={3}>
                <FormControl
                  type="text"
                  value={value}
                  onChange={this.handleVersionChange}
                  size={8}
                  autoFocus
                />
              </Col>
            </FormGroup>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <ConfirmButtons
            saveLabel="Change"
            isDisabled={!this.isValid() || this.props.currentVersion === this.getVersion()}
            onCancel={this.closeModal}
            onSave={this.handleSave}
            isSaving={this.props.isSaving}
          />
        </Modal.Footer>
      </Modal>
    );
  },

  getVersion() {
    return this.props.localState.get('version', '');
  },

  closeModal() {
    this.props.onHide();
  },

  handleSave() {
    this.props.onSave(this.getVersion()).then(() => this.props.onHide());
  },

  handleVersionChange(e) {
    const value = e.target.value;
    this.props.updateLocalState('version', value);
  }
});
