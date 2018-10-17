import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import underscoreString from 'underscore.string';
import classnames from 'classnames';
import { Modal, FormControl, HelpBlock } from 'react-bootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';

export default React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    phaseId: PropTypes.string,
    existingIds: PropTypes.object.isRequired,
    onPhaseUpdate: React.PropTypes.func.isRequired,
    onHide: React.PropTypes.func.isRequired,
    show: React.PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      value: null
    };
  },

  componentWillReceiveProps(newProps) {
    if (!this.state.value && newProps.phaseId) {
      this.setState({
        value: newProps.phaseId
      });
    }
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
        <form onSubmit={this.handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Rename Phase</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="form form-horizontal">
              <div className={classnames('form-group', { 'has-error': this.alreadyExist() })}>
                <div className="col-sm-12">
                  <FormControl autoFocus type="text" value={this.state.value} onChange={this.handlePhaseChange} />
                  <HelpBlock>
                    {this.alreadyExist()
                      ? `Phase with name ${this.state.value} already exists.`
                      : 'Phase name is a unique string and helps to describe the phase. Typical name could be extract, transform, load etc.'}
                  </HelpBlock>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <ConfirmButtons
              formButtons={true}
              saveLabel="Rename"
              isDisabled={!this.isValid()}
              onCancel={this.closeModal}
              onSave={this.handleSubmit}
              isSaving={false}
            />
          </Modal.Footer>
        </form>
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
