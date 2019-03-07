import React from 'react';
import { fromJS } from 'immutable';
import { Modal } from 'react-bootstrap';
import { ExternalLink } from '@keboola/indigo-ui';

import { Input } from './../../../../react/common/KbcBootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';

import actionCreators from '../../actionCreators';

const FIELD = 'incrementalLoad';
const GRAIN = 'grain';

export default React.createClass({
  propTypes: {
    columns: React.PropTypes.object.isRequired,
    table: React.PropTypes.object.isRequired,
    configurationId: React.PropTypes.string.isRequired
  },

  getInitialState() {
    return { showModal: false };
  },

  open() {
    return this.setState({
      showModal: true
    });
  },

  close() {
    return this.setState({
      showModal: false
    });
  },

  _handleEditStart() {
    actionCreators.startTableFieldEdit(
      this.props.configurationId,
      this.props.table.get('id'),
      FIELD
    );
    actionCreators.startTableFieldEdit(
      this.props.configurationId,
      this.props.table.get('id'),
      GRAIN
    );
    return this.open();
  },

  _handleEditSave() {
    const fields = {};
    fields[FIELD] = this.props.table.getIn(['editingFields', FIELD]);
    fields[GRAIN] = this.props.table.getIn(['editingFields', GRAIN]);
    actionCreators.saveMultipleTableFields(
      this.props.configurationId,
      this.props.table.get('id'),
      fields
    );
    return this.close();
  },

  _handleModeRadioChange(mode) {
    if (mode === 'full') {
      return this._handleEditChange({
        incrementalLoad: false
      });
    } else {
      return this._handleEditChange({
        incrementalLoad: 1
      });
    }
  },

  _handleIncrementalDaysNumber(e) {
    return this._handleEditChange({
      incrementalLoad: parseInt(e.target.value, 10)
    });
  },

  componentWillReceiveProps(nextProps) {
    const isSavingCurrent = this.props.table.get('savingFields').contains(FIELD);
    const isSavingNew = nextProps.table.get('savingFields').contains(FIELD);
    if (isSavingCurrent && !isSavingNew) {
      return this.close();
    }
  },

  _handleGrainChange(newGrain) {
    return actionCreators.updateTableFieldEdit(
      this.props.configurationId,
      this.props.table.get('id'),
      GRAIN,
      newGrain
    );
  },

  _handleEditChange(data) {
    return actionCreators.updateTableFieldEdit(
      this.props.configurationId,
      this.props.table.get('id'),
      FIELD,
      data[FIELD]
    );
  },

  _getTitle() {
    return `Table ${this.props.table.getIn(['data', 'title'])} Load Type`;
  },

  render() {
    let incrementalLoad;
    const isSaving = this.props.table.get('savingFields').contains(FIELD);
    let grain = '';
    if (this.props.table.hasIn(['editingFields', FIELD])) {
      incrementalLoad = this.props.table.getIn(['editingFields', FIELD]);
      grain = this.props.table.getIn(['editingFields', GRAIN]);
    } else {
      incrementalLoad = this.props.table.getIn(['data', FIELD]);
      grain = this.props.table.getIn(['data', GRAIN]);
    }

    const numberInput = (
      <input
        type="number"
        value={parseInt(incrementalLoad, 10)}
        onChange={this._handleIncrementalDaysNumber}
        className="form-control"
        style={{
          width: '50px',
          display: 'inline-block'
        }}
      />
    );

    const incrementalHelp = (
      <span>
        {'Data will be appended to the dataset. '}
        {'Only rows created or updated in last '}
        {numberInput} {incrementalLoad === 1 ? 'day' : 'days'}
        {' will be uploaded to the dataset.'}
      </span>
    );

    return (
      <span>
        {this.renderOpenButton()}
        <Modal show={this.state.showModal} onHide={this.close}>
          <Modal.Header closeButton={true}>
            <Modal.Title>{this._getTitle()}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="form-horizontal">
              <Input
                bsSize="small"
                type="radio"
                wrapperClassName="col-sm-offset-2 col-sm-8"
                help="All data in GoodData dataset will be replaced by current data in source Storage table."
                label="Full Load"
                checked={!incrementalLoad}
                onChange={this._handleModeRadioChange.bind(this, 'full')}
                disabled={isSaving}
              />
              <div className="form-group form-group-sm">
                <div className="col-sm-offset-2 col-sm-8">
                  <div className="radio">
                    <label>
                      <input
                        type="radio"
                        label="Incremental"
                        checked={incrementalLoad > 0}
                        onChange={this._handleModeRadioChange.bind(this, 'incremental')}
                        disabled={isSaving}
                      />
                      <span>Incremental</span>
                    </label>
                  </div>
                  <span className="help-block">{incrementalHelp}</span>
                  {this._renderFactGrainSelector(grain || '', incrementalLoad > 0)}
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <ConfirmButtons
              isSaving={isSaving}
              isDisabled={isSaving}
              saveLabel="Save"
              onCancel={this.close}
              onSave={this._handleEditSave}
            />
          </Modal.Footer>
        </Modal>
      </span>
    );
  },

  _renderFactGrainSelector(grain, enabled) {
    let grainArray;
    if (grain === '') {
      grainArray = [];
    } else {
      grainArray = grain.split(',');
    }
    return (
      <div>
        <label>Fact Grain:</label>
        <div>
          <small>
            <ExternalLink href="https://developer.gooddata.com/article/set-fact-table-grain">
              https://developer.gooddata.com/article/set-fact-table-grain
            </ExternalLink>
          </small>
        </div>
        <div className="col-sm-12">
          {grainArray.map((g) => {
            return this._renderOneGrainFactSelect(g, grainArray, enabled);
          })}
          {grainArray.length !== this.props.columns.count() && this._renderOneGrainFactSelect('', grainArray, enabled)}
        </div>
        {(() => {
          if (this.props.columns.count() === 0) {
            return (
              <div className="text text-warning">
                <strong>{'Warning: '}</strong>
                {'Violated conditions for fact grain: \
    There must be at least one column of attribute, reference or date type and no connection point.'}
              </div>
            );
          } else if ((grainArray.length < 2 || grainArray.length > 32) && enabled) {
            return (
              <div className="text text-warning">
                <strong>{'Warning: '}</strong>
                {grainArray.length < 2
                  ? 'Insufficient number of attributes or references selected for the fact grain. There must be at least 2.'
                  : 'Too many attributes or references selected for the fact grain. There must be maximum 32.'}
              </div>
            );
          }
        })()}
      </div>
    );
  },

  _renderOneGrainFactSelect(selectedColumn, grainArray, enabled) {
    let columnsOptions = null;
    let { columns } = this.props;
    if ((!columns || columns.count() === 0) && selectedColumn !== '') {
      const tmp = {};
      tmp[selectedColumn] = selectedColumn;
      columns = fromJS(tmp);
    }
    if (columns) {
      columnsOptions = columns
        .filter((value, key) => !grainArray.includes(key) || key === selectedColumn)
        .map((value, key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))
        .toArray();
      columnsOptions = columnsOptions.concat(
        <option key="" value="" disabled="true">
          - add -
        </option>
      );
    }
    return (
      <span style={{ 'paddingLeft': 0 }} className="col-sm-4">
        <select
          className="form-control"
          disabled={!enabled}
          type="select"
          value={selectedColumn}
          onChange={(e) => this._onChangeGrainColumn(e.target.value, selectedColumn, grainArray)}
        >
          {columnsOptions}
        </select>
        {selectedColumn !== '' && enabled && (
          <span
            className="fa fa-fw kbc-icon-cup kbc-cursor-pointer"
            onClick={() => this._onRemoveGrainColumn(selectedColumn, grainArray)}
          />
        )}
      </span>
    );
  },

  _onRemoveGrainColumn(col, grainArray) {
    return this._handleGrainChange(
      grainArray.filter((g) => g !== col).join(',')
    );
  },

  _onChangeGrainColumn(newGrain, oldGrain, grainArr) {
    let grainArray = grainArr;
    if (oldGrain !== '') {
      grainArray = grainArray.filter((g) => g !== oldGrain);
    }
    grainArray.push(newGrain);
    return this._handleGrainChange(grainArray.join(','));
  },

  _loadTypeLabel() {
    switch (this.props.table.getIn(['data', 'incrementalLoad'])) {
      case false:
      case 0:
        return 'Full';
      case 1:
        return 'Incremental  1 day';
      default:
        return `Incremental  ${this.props.table.getIn(['data', 'incrementalLoad'])} days`;
    }
  },

  renderOpenButton() {
    return (
      <span onClick={this._handleEditStart} className="btn label label-default">
        {'Load: '}
        {this._loadTypeLabel()} <span className="kbc-icon-pencil" />
      </span>
    );
  }
});
