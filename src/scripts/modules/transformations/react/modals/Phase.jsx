import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { Form, FormControl, FormGroup, Modal, ControlLabel } from 'react-bootstrap';
import { ExternalLink } from '@keboola/indigo-ui';
import Tooltip from './../../../../react/common/Tooltip';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';
import actionCreators from '../../ActionCreators';

export default createReactClass({
  mixins: [PureRenderMixin],
  propTypes: {
    transformation: PropTypes.object.isRequired,
    bucketId: PropTypes.string.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      isSaving: false,
      phase: this.props.transformation.get('phase'),
      showModal: false
    };
  },

  open() {
    if (!this.props.disabled) {
      this.setState({
        showModal: true
      });
    }
  },

  close() {
    this.setState({
      isSaving: false,
      showModal: false
    });
  },

  render() {
    return (
      <span>
        {this.renderOpenButton()}

        <Modal onHide={this.close} show={this.state.showModal}>
          <Form onSubmit={this.handleSubmit} inline>
            <Modal.Header closeButton={true}>
              <Modal.Title>Transformation Phase</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>
                <ExternalLink href="https://help.keboola.com/manipulation/transformations/#phases">
                  A phase
                </ExternalLink>
                {' '}is a set of transformations.
              </p>
              <p>
                Phases may be used to divide transformations into logical blocks, transfer data between
                transformations, transformation engines, and remote transformations.
              </p>
              <FormGroup controlId="phaseNumber">
                <ControlLabel>Phase #</ControlLabel>{' '}
                <FormControl
                  type="number"
                  min={1}
                  autoFocus
                  value={parseInt(this.state.phase, 10)}
                  onChange={this.handlePhaseChange}
                  disabled={this.state.isSaving}
                  style={{ width: '5em' }}
                />
              </FormGroup>
            </Modal.Body>
            <Modal.Footer>
              <ConfirmButtons
                saveButtonType="submit"
                isSaving={this.state.isSaving}
                onCancel={this.close}
                onSave={this.handleSubmit}
                isDisabled={!this.isValid()}
              />
            </Modal.Footer>
          </Form>
        </Modal>
      </span>
    );
  },

  renderOpenButton() {
    if (this.props.disabled) {
      return (
        <span onClick={this.open} className="label kbc-label-rounded-small label-default kbc-cursor-pointer">
          Phase: {this.props.transformation.get('phase')}
        </span>
      );
    } else {
      return (
        <Tooltip tooltip="Change Transformation Phase" placement="top">
          <span onClick={this.open} className="label kbc-label-rounded-small label-default kbc-cursor-pointer">
            Phase: {this.props.transformation.get('phase')} <span className="kbc-icon-pencil" />
          </span>
        </Tooltip>
      );
    }
  },

  handlePhaseChange(e) {
    if (e.target.value < 0) {
      return;
    }
    this.setState({
      phase: e.target.value
    });
  },

  handleSubmit(e) {
    e.preventDefault();
    this.setState({
      isSaving: true
    });
    actionCreators
      .changeTransformationProperty(this.props.bucketId, this.props.transformation.get('id'), 'phase', this.state.phase)
      .then(() => this.close())
      .catch(error => {
        this.setState({
          isSaving: false
        });
        throw error;
      });
  },

  isValid() {
    return this.state.phase >= 1;
  }
});
