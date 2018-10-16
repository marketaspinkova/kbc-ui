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
      value: null,
      isSaving: false
    };
  },

  alreadyExist() {
    const val = this.state.value;
    return this.props.existingIds.find(eid => eid === val);
  },

  isValid() {
    const val = this.state.value;
    return val && val !== this.props.phaseId && !this.alreadyExist();
  },

  render() {
    const value = this.state.value === null ? this.props.phaseId : this.state.value;

    return (
      <Modal show={this.props.show} onHide={this.props.onHide}>
        <form onSubmit={this.handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Rename Phase</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="form form-horizontal">
              <div className={classnames('form-group', { 'has-error': this.alreadyExist() })}>
                <div className="col-sm-12">
                  <FormControl id="title" type="text" value={value} onChange={this.handlePhaseChange} />
                  <HelpBlock>
                    {this.alreadyExist()
                      ? `Phase with name ${value} already exists.`
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
              isSaving={this.state.isSaving}
            />
          </Modal.Footer>
        </form>
      </Modal>
    );
  },

  closeModal() {
    this.setState({
      value: null
    });
    this.props.onHide();
  },

  handleSubmit(e) {
    this.setState({
      isSaving: true
    });
    this.props.onPhaseUpdate(this.state.value);
    this.setState({
      value: null,
      isSaving: false
    });
    e.preventDefault();
  },

  handlePhaseChange(e) {
    this.setState({
      value: underscoreString.capitalize(e.target.value)
    });
  }
});
