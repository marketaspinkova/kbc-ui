import React, {PropTypes} from 'react';
import { Checkbox, Col, FormGroup } from 'react-bootstrap';
import Select from '../../../../react/common/Select';
import {List} from 'immutable';
import ChangedSinceFilterInput from '../../../components/react/components/generic/ChangedSinceFilterInput';
import DataFilterRow from '../../../components/react/components/generic/DataFilterRow';
import ColumnsSelectRow from '../../../components/react/components/generic/ColumnsSelectRow';

export default React.createClass({
  propTypes: {
    mapping: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
    exclude: PropTypes.object
  },

  getInitialState() {
    return {
      showDetails: false
    };
  },

  render() {
    return (
      <div className="form-horizontal">
        <FormGroup>
          <Col md={10} mdOffset={2}>
            <Checkbox
              checked={this.state.showDetails}
              onChange={this.handleToggleShowDetails}
            >
              Show details
            </Checkbox>
          </Col>
        </FormGroup>
        <div className="form-group">
          <label className="col-md-2 control-label">
            Input Table
          </label>
          <div className="col-md-10">
            <Select
              name="Input table"
              value={this.props.mapping.get('source', '')}
              disabled={this.props.disabled}
              placeholder="Source table"
              onChange={this.handleChangeSource}
              options={this.getTables()}
              autoFocus
            />
            <span className="help-block">
              Select source table from Storage
            </span>
          </div>
        </div>
        {this.renderColumnFilter()}
        {this.renderChangedSinceFilter()}
        {this.renderDataFilter()}
      </div>
    );
  },

  renderColumnFilter() {
    if (this.state.showDetails) {
      return (
        <ColumnsSelectRow
          value={this.props.mapping}
          disabled={this.props.disabled}
          onChange={this.props.onChange}
          allTables={this.props.tables}
        />
      );
    }
    return null;
  },

  renderChangedSinceFilter() {
    if (this.state.showDetails) {
      return (
        <ChangedSinceFilterInput
          mapping={this.props.mapping}
          disabled={this.props.disabled}
          onChange={this.props.onChange}
        />
      );
    }
    return null;
  },

  renderDataFilter() {
    if (this.state.showDetails) {
      return (
        <DataFilterRow
          value={this.props.mapping}
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
    const destination = value + '.csv';
    const newMapping = this.props.mapping
      .set('source', value)
      .set('destination', destination)
      .set('where_column', '')
      .set('where_values', List())
      .set('where_operator', 'eq')
      .set('columns', List());

    return this.props.onChange(newMapping);
  },

  getTables() {
    const inOutTables = this.props.tables.filter((table) => {
      return (table.get('id').substr(0, 3) === 'in.' || table.get('id').substr(0, 4) === 'out.')
        && !this.props.exclude.some((t) => (t.get('source') === table.get('id')));
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
