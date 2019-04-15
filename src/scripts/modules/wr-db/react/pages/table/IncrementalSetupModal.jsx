import PropTypes from 'prop-types';
import React from 'react';

import createReactClass from 'create-react-class';

import {fromJS} from 'immutable';
import {Modal} from 'react-bootstrap';
import ConfirmButtons from '../../../../../react/common/ConfirmButtons';
import Select from 'react-select';
import ChangedSinceInput from '../../../../components/react/components/generic/ChangedSinceFilterInput';
import DataFilterRow from '../../../../components/react/components/generic/DataFilterRow';
import ThoughtSpotTypeInput from './ThoughtSpotTypeInput';
import AutomaticLoadTypeLastUpdated from '../../../../../react/common/AutomaticLoadTypeLastUpdated';
import changedSinceConstants from '../../../../../react/common/changedSinceConstants';

import ApplicationStore from '../../../../../stores/ApplicationStore';
import {FEATURE_ADAPTIVE_INPUT_MAPPING} from '../../../../../constants/KbcConstants';

export default createReactClass({
  propTypes: {
    columns: PropTypes.object.isRequired,
    allTables: PropTypes.object.isRequired,
    currentPK: PropTypes.string.isRequired,
    currentMapping: PropTypes.object,
    isIncremental: PropTypes.bool,
    onSave: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
    isSaving: PropTypes.bool.isRequired,
    componentId: PropTypes.string.isRequired,
    customFieldsValues: PropTypes.object
  },

  getStateFromProps(props) {
    return {
      primaryKey: props.currentPK,
      mapping: props.currentMapping,
      isIncremental: props.isIncremental,
      customFieldsValues: props.customFieldsValues
    };
  },

  getInitialState() {
    return this.getStateFromProps(this.props);
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.isSaving) return;
    this.setState(this.getStateFromProps(nextProps));
  },

  renderCustomFields() {
    if (this.props.componentId === 'keboola.wr-thoughtspot') {
      return this.renderThoughtSpotTypeInput();
    }
    return null;
  },

  render() {
    return (
      <Modal
        bsSize="large"
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
            {this.renderCustomFields()}
            <div className="form-group">
              <label className="control-label col-sm-3">
                Load Type
              </label>
              <div className="col-sm-9">
                <div className="radio">
                  <label>
                    <input
                      type="radio"
                      label="Full Load"
                      checked={!this.state.isIncremental}
                      onChange={() => this.setState({isIncremental: false, mapping: this.state.mapping.set('changed_since', '')})}
                    />
                    <span>Full Load</span>
                  </label>
                </div>
                <p className="help-block">
                  Replace all existing rows in the destination table.
                </p>

                { ApplicationStore.hasCurrentProjectFeature(FEATURE_ADAPTIVE_INPUT_MAPPING) && (
                  <div>
                    <div className="radio">
                      <label>
                        <input
                          type="radio"
                          label="Automatic Incremental Load"
                          checked={this.state.isIncremental && this.state.mapping.get('changed_since') === changedSinceConstants.ADAPTIVE_VALUE}
                          onChange={() => this.setState({isIncremental: true, mapping: this.state.mapping.set('changed_since', changedSinceConstants.ADAPTIVE_VALUE)})}
                        />
                        <span>Automatic Incremental Load</span>
                      </label>
                    </div>
                    <p className="help-block">
                      Append all data that has been added or changed since the last successful run.
                      If a primary key is specified, updates will be applied to rows with matching
                      primary key column values.
                    </p>
                    {this.state.isIncremental
                      && this.state.mapping.get('changed_since') === changedSinceConstants.ADAPTIVE_VALUE && (
                      <AutomaticLoadTypeLastUpdated
                        tableId={this.state.mapping.get('source')}
                      />
                    )}
                  </div>
                )}

                <div className="radio">
                  <label>
                    <input
                      type="radio"
                      label="Manual Incremental Load"
                      checked={this.state.isIncremental && this.state.mapping.get('changed_since') !== changedSinceConstants.ADAPTIVE_VALUE}
                      onChange={() => this.setState({isIncremental: true, mapping: this.state.mapping.set('changed_since', '')})}
                    />
                    <span>Manual Incremental Load</span>
                  </label>
                </div>
                <p className="help-block">
                  Append all selected data. If a primary key is specified, updates will be applied to rows with matching primary key column values.
                </p>

              </div>
            </div>
            {this.state.mapping.get('changed_since') !== changedSinceConstants.ADAPTIVE_VALUE && (
            <ChangedSinceInput
              disabled={false}
              label="Data changed in last"
              labelClassName="col-sm-3"
              wrapperClassName="col-sm-9"
              groupClassName="form-group"
              onChange={(value) => this.setState({mapping: value})}
              mapping={this.state.mapping}
              helpBlock="When specified, only rows changed or created within the selected time period will be loaded."
            />
            )}
            <DataFilterRow
              value={this.state.mapping}
              disabled={false}
              allTables={this.props.allTables}
              onChange={(value) => this.setState({mapping: value})}
              groupClassName="form-group"
              labelClassName="col-xs-3 control-label"
              whereColumnClassName="col-xs-3"
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
      <div className="form-group">
        <label htmlFor="title" className="col-sm-3 control-label">
          Destination Table <div>Primary Key</div>
        </label>
        <div className="col-sm-9">
          <Select
            placeholder="select from database column names"
            clearable={false}
            key="primary key select"
            name="pkelector"
            multi={true}
            value={this.state.primaryKey}
            onChange= {(newValue) => this.setState({primaryKey: newValue.map(v => v.value).join(',')})}
            options= {this.getColumns()}
          />
          <span className="help-block">
            Used to determine matching rows for updates in incremental loads.
          </span>
        </div>
      </div>

    );
  },

  renderThoughtSpotTypeInput() {
    return (
      <ThoughtSpotTypeInput
        value={this.state.customFieldsValues.get('type', 'standard')}
        onChange={(value) => this.setState({
          customFieldsValues: this.state.customFieldsValues.set('type', value)
        })}
      />
    );
  },

  getColumns() {
    return this.props.columns.map((key) => {
      return {
        'label': key,
        'value': key
      };
    }).toList().toJS();
  },

  closeModal() {
    this.props.onHide();
  },

  handleSave() {
    let pkToSave = this.state.primaryKey ? this.state.primaryKey.split(',') : [];
    this.props.onSave(
      this.state.isIncremental,
      fromJS(pkToSave),
      this.state.mapping,
      this.state.customFieldsValues
    ).then(() =>
      this.closeModal()
    );
  }
});
