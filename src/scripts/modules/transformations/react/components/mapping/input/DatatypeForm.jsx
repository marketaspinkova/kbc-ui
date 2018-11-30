import React from 'react';
import {Table} from 'react-bootstrap';
import {Input} from './../../../../../../react/common/KbcBootstrap';
import DatatypeFormRow from './DatatypeFormRow';

export default React.createClass({
  propTypes: {
    datatypes: React.PropTypes.object.isRequired,
    columns: React.PropTypes.object.isRequired,
    datatypesMap: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
    disabled: React.PropTypes.bool
  },

  getInitialState() {
    return {
      convertAll: false
    };
  },

  handleDatatypeChange(newType) {
    this.props.onChange(this.props.datatypes.set(newType.get('column'), newType));
  },

  handleConvertAllChange(e) {
    this.setState({convertAll: e.target.checked});
    this.props.onChange(this.props.datatypes.map((datatype) => {
      return datatype.set('convertEmptyValuesToNull', e.target.checked);
    }));
  },

  renderColumn(column) {
    const columnObject = this.props.datatypes.filter((type) => {
      return type.get('column') === column;
    });
    return (
      <DatatypeFormRow
        key={column}
        datatype={columnObject.get(column)}
        datatypesMap={this.props.datatypesMap}
        onChange={this.handleDatatypeChange}
        disabled={this.props.disabled}
      />
    );
  },

  render() {
    if (this.props.disabled) {
      return (
        <div className="help-block">
          A source table must be selected to define data types.
        </div>
      );
    }
    return (
      <Table striped hover>
        <thead>
          <tr>
            <th>
              Column
            </th>
            <th>
              Type
            </th>
            <th>
              Length
            </th>
            <th>
              <Input
                name="convertAll"
                type="checkbox"
                checked={this.state.convertAll}
                onChange={this.handleConvertAllChange}
                label={
                  <span>Set all empty values to <code>null</code></span>
                }
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {this.props.columns.map((column) => {
            return this.renderColumn(column);
          })}
        </tbody>
      </Table>
    );
  }
});
