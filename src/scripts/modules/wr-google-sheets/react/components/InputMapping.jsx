import React, {PropTypes} from 'react';
import {Input} from 'react-bootstrap';
import Select from '../../../../react/common/Select';
import {List} from 'immutable';
import DaysFilterInput from '../../../components/react/components/generic/DaysFilterInput';
import DataFilterRow from '../../../components/react/components/generic/DataFilterRow';
import ColumnsSelectRow from '../../../components/react/components/generic/ColumnsSelectRow';

export default React.createClass({
  propTypes: {
    value: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      showDetails: false
    };
  },

  render() {
    return (
      <div className="form-horizontal">
        <div className="row">
          <div className="form-group">
            <div className="col-xs-10 col-xs-offset-2">
              <Input
                standalone={true}
                type="checkbox"
                label="Show details"
                checked={this.state.showDetails}
                onChange={this.handleToggleShowDetails}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="col-md-2 control-label">
              Input Table
            </label>
            <div className="col-md-10">
              <Select
                name="Input table"
                value={this.props.value.get('source', '')}
                disabled={this.props.disabled}
                placeholder="Source table"
                onChange={this.handleChangeSource}
                options={this.getTables()}
              />
              <span className="help-block">
                Select source table from Storage
              </span>
            </div>
          </div>
        </div>
        {this.renderColumnFilter()}
        {this.renderDaysFilter()}
        {this.renderDataFilter()}
      </div>
    );
  },

  renderColumnFilter() {
    if (this.state.showDetails) {
      return (
          <ColumnsSelectRow
            value={this.props.value}
            disabled={this.props.disabled}
            onChange={this.props.onChange}
            allTables={this.props.tables}
          />
      );
    }
    return null;
  },

  renderDaysFilter() {
    if (this.state.showDetails) {
      return (
        <div className="row">
          <DaysFilterInput
            mapping={this.props.value}
            disabled={this.props.disabled}
            onChange={this.props.onChange}
          />
        </div>
      );
    }
    return null;
  },

  renderDataFilter() {
    if (this.state.showDetails) {
      return (
        <DataFilterRow
          value={this.props.value}
          disabled={this.props.disabled}
          onChange={this.props.onChange}
          allTables={this.props.tables}
        />
      );
    }
    return null;
  },

  handleToggleShowDetails(e) {
    this.setState({
      showDetails: e.target.checked
    });
  },

  handleChangeSource(value) {
    const newMapping = this.props.value.withMutations((mapping) => {
      const destination = value.substr(value.lastIndexOf('.') + 1) + '.csv';
      return mapping
        .set('source', value)
        .set('destination', destination)
        .set('where_column', '')
        .set('where_values', List())
        .set('where_operator', 'eq')
        .set('columns', List());
    });
    return this.props.onChange(newMapping);
  },

  getTables() {
    const inOutTables = this.props.tables.filter((table) => {
      return table.get('id').substr(0, 3) === 'in.' || table.get('id').substr(0, 4) === 'out.';
    });

    const options = inOutTables.map((table) => {
      return {
        label: table.get('id'),
        value: table.get('id')
      };
    });

    return options.toList().sort((valA, valB) => {
      if (valA.label > valB.label) return 1;
      if (valA.label < valB.label) return -1;
      return 0;
    }).toJS();
  }
});