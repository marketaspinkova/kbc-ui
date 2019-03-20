import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {capitalize} from 'underscore.string';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {Modal} from 'react-bootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';
import Select from 'react-select';

export default createReactClass({
  mixins: [PureRenderMixin],
  propTypes: {
    phases: PropTypes.object.isRequired,
    onMoveTasks: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
    title: PropTypes.string,
    ignorePhaseId: PropTypes.string
  },

  getInitialState() {
    return {
      value: null
    };
  },

  getDefaultProps() {
    return {
      title: 'Move Selected Tasks to Phase'
    };
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
            {this.props.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form form-horizontal">
            <div className={formDivClass}>
              <label htmlFor="title" className="col-sm-1 control-label" />
              <div className="col-sm-11">
                <Select.Creatable
                  placeholder="Select a phase or type a new..."
                  clearable={false}
                  key="phases select"
                  name="phaseselector"
                  allowCreate={true}
                  value={this.state.value}
                  onChange={input => this.setState({ value: input ? input.value : '' })}
                  onInputChange={inputValue => capitalize(inputValue)}
                  options= {this.getPhasesOptions()}
                />
                <span className="help-block">
                  Select an existing phase name or type a new phase name.
                </span>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <ConfirmButtons
            saveLabel="Move"
            isSaving={false}
            isDisabled={!this.isValid()}
            onCancel={this.closeModal}
            onSave={this.handleSave}
          />
        </Modal.Footer>
      </Modal>
    );
  },

  isValid() {
    return !!this.state.value;
  },

  getPhasesOptions() {
    const result = this.props.phases
      .filter((pid) => pid !== this.props.ignorePhaseId)
      .map((key) => {
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
    this.props.onHide();
  },

  handleSave() {
    this.props.onMoveTasks(this.state.value);
  }

});
