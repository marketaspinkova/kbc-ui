import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {fromJS, List, Map} from 'immutable';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';
import {Modal} from 'react-bootstrap';
import {sanitizeTableName, sheetFullName} from '../../common';
import ProcessorControls from '../components/ProcessorControls';
import Tooltip from '../../../../react/common/Tooltip';

export default createReactClass({

  propTypes: {
    show: PropTypes.bool.isRequired,
    isSaving: PropTypes.bool.isRequired,
    onHideFn: PropTypes.func,
    localState: PropTypes.object.isRequired,
    outputBucket: PropTypes.string.isRequired,
    savedSheets: PropTypes.object.isRequired,
    updateLocalState: PropTypes.func.isRequired,
    prepareLocalState: PropTypes.func.isRequired,
    onSaveSheetFn: PropTypes.func.isRequired
  },

  render() {
    const sheet = this.props.localState.get('sheet', Map());
    const documentTitle = sheetFullName(sheet, ' / ');
    const headerRowValue = this.headerRowValue();

    return (
      <Modal
        bsSize="large"
        show={this.props.show}
        onHide={this.props.onHideFn}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Edit Extraction of {documentTitle}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.renderEdit()}
        </Modal.Body>
        <Modal.Footer>
          <ConfirmButtons
            isSaving={this.props.isSaving}
            onSave={this.handleSave}
            onCancel={this.props.onHideFn}
            saveLabel="Save"
            isDisabled={Boolean(this.invalidReason()) || isNaN(headerRowValue) || headerRowValue < 1}
          />
        </Modal.Footer>
      </Modal>
    );
  },

  renderEdit() {
    const value = this.outputTableValue();
    const sanitized = sanitizeTableName(value);
    const err = this.invalidReason();

    return (
      <div className="form-horizontal">
        <div className="form-group">
          <label className="control-label col-sm-4">
            Output Table
          </label>
          <div className="col-sm-8">

            <span className={err ? 'has-error' : ''}>
              <div className="input-group">
                <div className="input-group-addon">
                  <small>{this.props.outputBucket}</small>.
                </div>
                <input
                  type="text"
                  className="form-control"
                  value={value}
                  onChange={this.onChange}/>
              </div>
              {
                err ?
                  <span className="help-block">
                    {err}
                  </span>
                  : null
              }
            </span>
            {
              sanitized !== value ?
                <span className="help-block">
                Table name will be sanitized to {sanitized}
                </span>
                : null
            }
          </div>
        </div>

        <div className="form-group">

          <label className="control-label col-sm-4">
            Enable Output Processor
          </label>
          <div className="col-sm-2">
            <Tooltip
              tooltip="Show Output Processor settings">
              <input
                style={{margin: '16px 0 0 2px'}}
                checked={this.transposeEnabledValue()}
                type="checkbox"
                onClick={this.toggleTransposeEnabled}
              />
            </Tooltip>
          </div>
        </div>

        {this.transposeEnabledValue() ? this.renderProcessorControls() : ''}

      </div>
    );
  },

  renderProcessorControls() {
    return (
      <ProcessorControls
        headerRowValue={this.headerRowValue()}
        onChangeHeaderRow={this.onChangeHeaderRow}
        headerColumnNamesValue={this.headerColumnNamesValue()}
        onChangeHeaderColumnNames={this.onChangeHeaderColumnNames}
        transposeHeaderRowValue={this.transposeHeaderRowValue()}
        onChangeTransposeHeaderRow={this.onChangeTransposeHeaderRow}
        transposedHeaderColumnNameValue={this.transposedHeaderColumnNameValue()}
        onChangeTransposedHeaderColumnName={this.onChangeTransposedHeaderColumnName}
        transposeFromValue={this.transposeFromValue()}
        onChangeTransposeFrom={this.onChangeTransposeFrom}
      />
    );
  },

  handleSave() {
    const sanitized = sanitizeTableName(this.outputTableValue());
    const sheet = this.props.localState.get('sheet');
    this.props.updateLocalState('dontValidate', true);
    const newSheet = sheet
      .set('outputTable', sanitized)
      .setIn(['header', 'rows'], this.headerRowValue())
    ;
    const processor = this.props.localState.get('processor');
    const newProcessor = processor
      .setIn(['transpose'], this.transposeEnabledValue())
      .setIn(['header_rows_count'], this.headerRowValue())
      .setIn(['header_column_names'], this.headerColumnNamesValue())
      .setIn(['header_transpose_row'], this.transposeHeaderRowValue())
      .setIn(['header_transpose_column_name'], this.transposedHeaderColumnNameValue())
      .setIn(['transpose_from_column'], this.transposeFromValue())
    ;
    return this.props.onSaveSheetFn(newSheet, newProcessor).then(this.props.onHideFn);
  },

  outputTableValue() {
    const defaultValue = this.props.localState.getIn(['sheet', 'outputTable'], '');
    return this.props.localState.get('value', defaultValue).trim();
  },

  headerRowValue() {
    const defaultValue = this.props.localState.getIn(['sheet', 'header', 'rows'], 1);
    return this.props.localState.get('headerRow', defaultValue);
  },

  onChangeHeaderRow(e) {
    const newVal = parseInt(e.target.value, 10);
    this.props.updateLocalState('headerRow', newVal);
  },

  transposeEnabledValue() {
    const defaultValue = this.props.localState.getIn(['processor', 'parameters', 'transpose'], false);
    return this.props.localState.get('transposeEnabled', defaultValue);
  },

  toggleTransposeEnabled() {
    const defaultValue = !!this.props.localState.get('transposeEnabled', false);
    this.props.updateLocalState('transposeEnabled', !defaultValue);
  },

  headerColumnNamesValue() {
    const defaultValue = this.props.localState.getIn(['processor', 'parameters', 'header_column_names'], List());
    const columnNames = this.props.localState.get('headerColumnNames', defaultValue);
    const columnNamesArr = (columnNames === null) ? [] : columnNames.toArray();
    return columnNamesArr.length > 0 ? columnNamesArr : null;
  },

  onChangeHeaderColumnNames(columnsArray) {
    this.props.updateLocalState('headerColumnNames', fromJS(columnsArray));
  },

  transposeHeaderRowValue() {
    const defaultValue = this.props.localState.getIn(['processor', 'parameters', 'header_transpose_row'], 0);
    return this.props.localState.get('transposeHeaderRow', defaultValue);
  },

  onChangeTransposeHeaderRow(e) {
    const maxVal = this.props.localState.get('headerRow', 1);
    const newVal = (e.target.value > maxVal) ? maxVal : e.target.value;
    this.props.updateLocalState('transposeHeaderRow', newVal);
  },

  transposedHeaderColumnNameValue() {
    const defaultValue = this.props.localState.getIn(['processor', 'parameters', 'header_transpose_column_name'], '');
    return this.props.localState.get('transposedHeaderColumnName', defaultValue).trim();
  },

  onChangeTransposedHeaderColumnName(e) {
    const newVal = e.target.value;
    this.props.updateLocalState('transposedHeaderColumnName', newVal);
  },

  transposeFromValue() {
    const defaultValue = this.props.localState.getIn(['processor', 'parameters', 'transpose_from_column'], 0);
    return this.props.localState.get('transposeFrom', defaultValue);
  },

  onChangeTransposeFrom(e) {
    const newVal = e.target.value;
    this.props.updateLocalState('transposeFrom', newVal);
  },

  invalidReason() {
    if (this.props.localState.get('dontValidate')) return null;
    const value = this.outputTableValue();
    if (!value || value.length === 0) return 'Can not be empty.';
    const sanitized = sanitizeTableName(value);
    const savedValue = this.props.localState.getIn(['sheet', 'outputTable']);
    if (savedValue !== sanitized && this.props.savedSheets.find((s) => s.get('outputTable') === sanitized)) return `Table name ${sanitized} already exists in the configuration.`;
    return null;
  },

  onChange(e) {
    const newVal = e.target.value;
    this.props.updateLocalState('value', newVal);
  }
});
