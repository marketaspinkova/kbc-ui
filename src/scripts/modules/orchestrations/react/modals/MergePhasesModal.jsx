import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {Modal} from 'react-bootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';
import Select from 'react-select';

export default createReactClass({
  mixins: [PureRenderMixin],
  propTypes: {
    tasks: PropTypes.object.isRequired,
    phases: PropTypes.object.isRequired,
    onMergePhases: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      value: null,
      isSaving: false
    };
  },


  isValid() {
    return !!this.state.value;
  },

  render() {
    let formDivClass = 'form-group';
    return (
      <Modal
        show={this.props.show}
        onHide={this.props.onHide}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Merge Selected Phases
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form form-horizontal">
            <div className={formDivClass}>
              <label htmlFor="title" className="col-sm-1 control-label">
                Into
              </label>
              <div className="col-sm-11">
                <Select.Creatable
                  placeholder="Select phase..."
                  clearable={false}
                  key="phases select"
                  name="phaseselector"
                  allowCreate={true}
                  value={this.state.value}
                  onChange={input => this.setState({ value: input ? input.value : '' })}
                  options= {this.getPhasesOptions()}
                />
                <span className="help-block">
                  Select a existing phase name or type new phase name.
                </span>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <ConfirmButtons
            saveLabel="Merge"
            isDisabled={!this.isValid()}
            onCancel={this.closeModal}
            onSave={this.handleSave}
            isSaving={this.state.isSaving}
          />
        </Modal.Footer>
      </Modal>
    );
  },

  getPhasesOptions() {
    const result = this.props.phases.map((key) => {
      return {
        'label': key,
        'value': key
      };
    });

    const phases = this.state.value !== null
      ? result.concat({label: this.state.value, value: this.state.value})
      : result;

    return phases.toList().toJS();
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
    this.props.onMergePhases(this.state.value);
    this.setState({
      value: null,
      isSaving: false
    });
  }

});
