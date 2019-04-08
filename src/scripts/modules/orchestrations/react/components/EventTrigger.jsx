import React from 'react';
import createReactClass from 'create-react-class';
import {Col, FormGroup, Table} from 'react-bootstrap';
import PropTypes from 'prop-types';
import Select from 'react-select';
import later from 'later';
import ControlLabel from 'react-bootstrap/es/ControlLabel';

const PERIOD_OPTIONS = [
  {
    value: later.minute.name,
    label: 'Minute'
  },
  {
    value: later.hour.name,
    label: 'Hour'
  },
  {
    value: later.day.name,
    label: 'Day'
  },
  {
    value: later.dayOfWeek.name,
    label: 'Week'
  },
  {
    value: later.month.name,
    label: 'Month'
  },
  {
    value: later.year.name,
    label: 'Year'
  }
];

export default createReactClass({
  propTypes: {
    tables: PropTypes.object.isRequired,
    selected: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    periodAll: PropTypes.string.isRequired,
    periodNotAll: PropTypes.string.isRequired,
    onPeriodAllChange: PropTypes.func.isRequired,
    onPeriodNotAllChange: PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      selected: this.props.selected || []
    };
  },

  render() {
    const selectedTables = this._getSelectedTables(this.state.selected);
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
              value={this.state.selected}
              multi={true}
              options={options}
              delimiter=","
              onChange={this._onChange}
              placeholder="Add tables..."
            />
          </Col>
        </FormGroup>
      </form>
    );
  },

  renderTables(tables) {
    return (
      <Table striped>
        <thead>
          <th> </th>
          <th>Name</th>
          <th>Last Import</th>
        </thead>
        <tbody>
        {tables.map((item, index) => {
          return (
            <tr key={index}>
              <td><i className="fa fa-fw fa-table" /></td>
              <td>{item.get('name')}</td>
              <td>{item.get('lastImportDate')}</td>
            </tr>
          );
        })}
        </tbody>
      </Table>
    );
  },

  renderPeriodSelect() {
    return (
      <form className="form-horizontal">
        <FormGroup>
          <Col componentClass={ControlLabel} sm={8}>
            <strong>If ALL tables are updated:</strong> run once per
          </Col>
          <Col sm={4} >
            <Select
              options={PERIOD_OPTIONS}
              value={this.props.period}
              onChange={this.props.onPeriodChange}
              clearable={false}
            />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={8}>
            <strong>If NOT ALL tables are updated:</strong> run once per
          </Col>
          <Col sm={4} >
            <Select
              options={PERIOD_OPTIONS}
              value={this.props.period}
              onChange={this.props.onPeriodChange}
              clearable={false}
            />
          </Col>
        </FormGroup>
      </form>
    );
  },

  _onChange(items) {
    const values = items.map(item => item.value);
    return this.setState({ selected: values }, () => this.props.onChange(this.state));
  },

  _getTables() {
    return this.props.tables.map(table => ({
      label: table.get('id'),
      value: table.get('id')
    })).toArray();
  },

  _getSelectedTables(selectedOptions) {
    return this.props.tables.filter(table => selectedOptions.includes(table.get('id')));
  }
});
