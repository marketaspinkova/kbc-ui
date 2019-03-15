import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Modal, ControlLabel, FormControl, FormGroup, Col } from 'react-bootstrap';
import moment from 'moment';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import ConfirmButtons from './ConfirmButtons';
import defaultCopyVersionName from '../../utils/defaultCopyVersionName';

export default createReactClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    version: PropTypes.object.isRequired,
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onCopy: PropTypes.func.isRequired,
    newVersionName: PropTypes.string,
    onChangeName: PropTypes.func.isRequired
  },

  onChange(e) {
    this.props.onChangeName(e.target.value);
  },

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Version Copy</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            This will copy version #{this.props.version.get('version')} created {moment(this.props.version.get('created')).fromNow()} by {this.props.version.getIn(['creatorToken', 'description'], 'unknown')} to a new configuration.
          </p>
          <form className="form-horizontal" onSubmit={this.handleSubmit}>
            <FormGroup>
              <Col componentClass={ControlLabel} xs={5}>New configuration name</Col>
              <Col xs={7}>
                <FormControl
                  type="text"
                  placeholder={defaultCopyVersionName(this.props.version)}
                  value={this.props.newVersionName}
                  onChange={this.onChange}
                  autoFocus
                />
              </Col>
            </FormGroup>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <ConfirmButtons
            isSaving={false}
            cancelLabel="Cancel"
            saveLabel="Copy"
            saveStyle="success"
            onCancel={this.props.onClose}
            onSave={this.props.onCopy}
            showSave={true}
          />
        </Modal.Footer>
      </Modal>
    );
  },

  handleSubmit(e) {
    e.preventDefault();
    this.props.onCopy();
  }
});
