import React, {PropTypes} from 'react';

import {fromJS} from 'immutable';
import {Modal} from 'react-bootstrap';
import ConfirmButtons from '../../../../../react/common/ConfirmButtons';
import Select from 'react-select';
import ChangedSinceInput from '../../../../components/react/components/generic/ChangedSinceFilterInput';

export default React.createClass({
  propTypes: {
    columns: PropTypes.object.isRequired,
    currentPK: PropTypes.object.isRequired,
    currentMapping: PropTypes.string,
    isIncremental: PropTypes.bool,
    onSave: React.PropTypes.func.isRequired,
    onHide: React.PropTypes.func.isRequired,
    show: React.PropTypes.bool.isRequired,
    isSaving: React.PropTypes.bool.isRequired
  },

  getStateFromProps(props) {
    return {
      primarykey: props.currentPK,
      mapping: props.currentMapping,
      isIncremental: props.isIncremental
    };
  },

  getInitialState() {
    return this.getStateFromProps(this.props);
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.isSaving) return;
    this.setState(this.getStateFromProps(nextProps));
  },

  render() {
    return (
      <Modal
        show={this.props.show}
        onHide={this.props.onHide}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Load Settings
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form form-horizontal">
            <div className="form-group form-group-sm">
              <label className="control-label col-sm-3">
                Load Type
              </label>
              <div className="col-sm-9">
                <div className="radio radio-sm">
                  <label>
                    <input
                      type="radio"
                      label="Full Load"
                      checked={!this.state.isIncremental}
                      onChange={() => this.setState({isIncremental: false})}
                    />
                    <span>Full Load</span>
                  </label>
                </div>
                <span className="help-block">
                  Load rows and replace them with all existing rows in the destination table.
                </span>

                <div className="radio radio-sm">
                  <label>
                    <input
                      type="radio"
                      label="Incremental Load"
                      checked={this.state.isIncremental}
                      onChange={() => this.setState({isIncremental: true})}
                    />
                    <span>Incremental Load</span>
                  </label>
                </div>
                <span className="help-block">
                  Load rows and append them to the destination table and/or update identical rows identified by primary key if specified.
                </span>
              </div>
            </div>

            <ChangedSinceInput
              label="Data changed in last"
              labelClassName="col-sm-3"
              wrapperClassName="col-sm-9"
              onChange={(value) => this.setState({mapping: value})}
              mapping={this.state.mapping}
              helpBlock="When specified, only rows changed or created up until the selected period will be loaded."
            />
            {this.renderPKSelector()}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <ConfirmButtons
            saveLabel="Save"
            isSaving={this.props.isSaving}
            isDisabled={false}
            onCancel={this.closeModal}
            onSave={this.handleSave}
          />
        </Modal.Footer>
      </Modal>
    );
  },

  renderPKSelector() {
    return (

      <div className="form-group form-group-sm">
        <label htmlFor="title" className="col-sm-3 control-label">
          Destination Table Primary Key
        </label>
        <div className="col-sm-9">
          <Select
            placeholder="select from database column names"
            clearable={false}
            key="primary key select"
            name="pkelector"
            multi={true}
            value={this.state.primarykey}
            onChange= {(newValue) => this.setState({primarykey: newValue.map(v => v.value).join(',')})}
            options= {this.getColumns()}
          />
          <span className="help-block">
            Used to identify the identical rows.
          </span>
        </div>
      </div>

    );
  },

  getColumns() {
    const result = this.props.columns.map((key) => {
      return {
        'label': key,
        'value': key
      };
    }).toList().toJS();
    return result;
  },

  closeModal() {
    this.props.onHide();
  },

  handleSave() {
    let pkToSave = [];
    pkToSave = this.state.primarykey ? this.state.primarykey.split(',') : [];
    this.props.onSave(this.state.isIncremental, fromJS(pkToSave), this.state.mapping).then(() =>
      this.closeModal()
    );
  }
});
