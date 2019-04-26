import React from 'react';
import createReactClass from 'create-react-class';
import {Button, Col, FormControl, FormGroup, InputGroup, Table} from 'react-bootstrap';
import PropTypes from 'prop-types';
import Select from 'react-select';
import ControlLabel from 'react-bootstrap/es/ControlLabel';
import moment from 'moment';
import date from '../../../../utils/date';
import Tooltip from '../../../../react/common/Tooltip';

export default createReactClass({
  propTypes: {
    tables: PropTypes.object.isRequired,
    selected: PropTypes.array,
    onAddTable: PropTypes.func.isRequired,
    onRemoveTable: PropTypes.func.isRequired,
    period: PropTypes.number.isRequired,
    onChangePeriod: PropTypes.func.isRequired
  },

  render() {
    const selectedTables = this._getSelectedTables(this.props.selected);
    return (
      <div>
        {selectedTables.count() ? this.renderTables(selectedTables) : this.renderEmptyIcon()}
        {this.renderAddTableForm()}
        {selectedTables.count() ? this.renderPeriodSelect() : null}
      </div>
    );
  },

  renderEmptyIcon() {
    return (
      <div className="text-muted" style={{textAlign: 'center'}}>
        <i className="fa fa-fw fa-table" style={{fontSize: '60px'}} />
        <p>Add tables from Storage</p>
      </div>
    );
  },

  renderAddTableForm() {
    const options = this._getTables();
    return (
      <form className="form-horizontal">
        <FormGroup>
          <Col sm={12}>
            <Select
              name="selectTables"
              multi={false}
              options={options}
              delimiter=","
              onChange={this._onAddTable}
              placeholder="Add tables..."
              clearable={true}
            />
          </Col>
        </FormGroup>
      </form>
    );
  },

  renderTables(tables) {
    return (
      <div>
        <h4>Orchestration will start each time all of these tables are updated:</h4>
        <Table striped hover>
          <thead>
          <tr>
            <th> </th>
            <th>Table</th>
            <th>Last Import</th>
            <th> </th>
          </tr>
          </thead>
          <tbody>
          {tables.map((item, index) => {
            return (
              <tr key={index}>
                <td><i className="fa fa-fw fa-table" /></td>
                <td>{item.get('id')}</td>
                <td>
                  <span title={moment(item.get('lastImportDate')).fromNow()}>
                    {date.format(item.get('lastImportDate'))}
                  </span>
                </td>
                <td>
                  <Tooltip placement="top" tooltip="Remove table">
                    <Button bsStyle="link" onClick={() => this._onRemoveTable(item.get('id'))}>
                      <i className="fa fa-trash-o" />
                    </Button>
                  </Tooltip>
                </td>
              </tr>
            );
          })}
          </tbody>
        </Table>
      </div>
    );
  },

  renderPeriodSelect() {
    return (
      <form className="form-horizontal">
        <FormGroup>
          <Col componentClass={ControlLabel} sm={6}>
            Cooldown period
          </Col>
          <Col sm={6} >
            <InputGroup>
              <FormControl
                id="periodValue"
                type="text"
                value={this.props.period}
                onChange={this.props.onChangePeriod}
              />
              <InputGroup.Addon>Minutes</InputGroup.Addon>
            </InputGroup>
          </Col>
        </FormGroup>
      </form>
    );
  },

  _onAddTable(item) {
    return this.props.onAddTable(item.value);
  },

  _onRemoveTable(tableId) {
    return this.props.onRemoveTable(tableId);
  },

  _getTables() {
    const selected = this.props.selected;
    const availableTables = this.props.tables.filter(table => !selected.includes(table.get('id')));

    return availableTables.map(table => ({
      label: table.get('id'),
      value: table.get('id')
    })).toArray();
  },

  _getSelectedTables(selectedOptions) {
    return this.props.tables.filter(table => selectedOptions.includes(table.get('id')));
  }
});
