import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import underscoreString from 'underscore.string';
import classnames from 'classnames';
import { Col, Modal, Form, FormGroup, FormControl, HelpBlock } from 'react-bootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';

export default createReactClass({
  mixins: [PureRenderMixin],

  propTypes: {
    phaseId: PropTypes.string,
    existingIds: PropTypes.object.isRequired,
    onPhaseUpdate: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      value: null
    };
  },

  alreadyExist() {
    return this.props.existingIds.find(eid => eid === this.state.value);
  },

  isValid() {
    return this.state.value && this.state.value !== this.props.phaseId && !this.alreadyExist();
  },

  render() {
    return (
      <Modal show={this.props.show} onHide={this.closeModal}>
        <Form onSubmit={this.handleSubmit} horizontal>
          <Modal.Header closeButton>
            <Modal.Title>Rename Phase</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormGroup bsClass={classnames('form-group', { 'has-error': this.alreadyExist() })}>
              <Col sm={12}>
                <FormControl
                  autoFocus
                  type="text"
                  value={this.state.value === null ? this.props.phaseId : this.state.value}
                  onChange={this.handlePhaseChange}
                />
                <HelpBlock>
                  {this.alreadyExist()
                    ? `Phase with name ${this.state.value} already exists.`
                    : 'Phase name is a unique string and helps to describe the phase. A typical name could be extract, transform, load, etc.'}
                </HelpBlock>
              </Col>
            </FormGroup>
          </Modal.Body>
          <Modal.Footer>
            <ConfirmButtons
              saveButtonType={'submit'}
              saveLabel="Rename"
              isDisabled={!this.isValid()}
              onCancel={this.closeModal}
              onSave={this.handleSubmit}
              isSaving={false}
            />
          </Modal.Footer>
        </Form>
      </Modal>
    );
  },

  handleSubmit(e) {
    this.props.onPhaseUpdate(this.state.value);
    this.setState({
      value: null
    });
    e.preventDefault();
  },

  closeModal() {
    this.setState({
      value: null
    });
    this.props.onHide();
  },

  handlePhaseChange(e) {
    this.setState({
      value: underscoreString.capitalize(e.target.value)
    });
  }
});
