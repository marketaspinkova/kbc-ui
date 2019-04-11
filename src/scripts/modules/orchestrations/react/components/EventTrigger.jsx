import React from 'react';
import createReactClass from 'create-react-class';
import {Col, FormControl, FormGroup, InputGroup, Table} from 'react-bootstrap';
import PropTypes from 'prop-types';
import Select from 'react-select';
import ControlLabel from 'react-bootstrap/es/ControlLabel';

export default createReactClass({
  propTypes: {
    tables: PropTypes.object.isRequired,
    selected: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    period: PropTypes.number.isRequired,
    onChangePeriod: PropTypes.func.isRequired
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
          <Col componentClass={ControlLabel} sm={6}>
            Check condition every
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
