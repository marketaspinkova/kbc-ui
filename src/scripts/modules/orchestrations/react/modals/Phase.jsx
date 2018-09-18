import React, {PropTypes} from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {Modal} from 'react-bootstrap';
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
    return this.props.existingIds.find((eid) => eid === val);
  },

  isValid() {
    const val = this.state.value;
    return val && val !== this.props.phaseId && !this.alreadyExist();
  },

  render() {
    const value = this.state.value === null ? this.props.phaseId : this.state.value;

    let formDivClass = 'form-group';
    let helpText = 'Phase name is a unique string and helps to describe the phase. Typical name could be extract, transform, load etc.';
    if (this.alreadyExist()) {
      formDivClass = 'form-group has-error';
      helpText = `Phase with name ${value} already exists.`;
    }
    const helpBlock = (<span className="help-block">{helpText}</span>);

    return (
      <Modal
        show={this.props.show}
        onHide={this.props.onHide}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Rename Phase
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form form-horizontal">
            <div className={formDivClass}>
              <div className="col-sm-12">
                <input
                  id="title"
                  type="text"
                  className="form-control"
                  value={value}
                  onChange={this.handlePhaseChange}
                />
                {helpBlock}
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <ConfirmButtons
            saveLabel="Rename"
            isDisabled={!this.isValid()}
            onCancel={this.closeModal}
            onSave={this.handleSave}
            isSaving={this.state.isSaving}
          />
        </Modal.Footer>
      </Modal>
    );
  },

  closeModal() {
    this.setState({
      value: null
    });
    this.props.onHide();
  },

  handleSave() {
    this.setState({
      isSaving: true
    });
    this.props.onPhaseUpdate(this.state.value);
    this.setState({
      value: null,
      isSaving: false
    });
  },

  handlePhaseChange(e) {
    this.setState({
      value: e.target.value
    });
  }


});
