import React from 'react';
import {Table, HelpBlock, Checkbox} from 'react-bootstrap';
import DatatypeFormRow from './DatatypeFormRow';
import parseDataType from '../../../../utils/parseDataType';

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
    let columnDataType = this.props.datatypes.find((type, columnName) => {
      const computedName = typeof type === 'string' ? columnName : type.get('column');
      return computedName === column;
    });
    const isOldFormat = typeof columnDataType === 'string';
    if (isOldFormat) {
      columnDataType = parseDataType(columnDataType, column);
    }
    return (
      <DatatypeFormRow
        key={column}
        columnName={column}
        datatype={columnDataType}
        datatypesMap={this.props.datatypesMap}
        onChange={this.handleDatatypeChange}
        disabled={this.props.disabled}
      />
    );
  },

  render() {
    if (this.props.disabled) {
      return (
        <HelpBlock>
          A source table must be selected to define data types.
        </HelpBlock>
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
              <Checkbox
                name="convertAll"
                checked={this.state.convertAll}
                onChange={this.handleConvertAllChange}
              >
                Set all empty values to <code>null</code>
              </Checkbox>
            </th>
          </tr>
        </thead>
        <tbody>
          {this.props.columns.map(this.renderColumn)}
        </tbody>
      </Table>
    );
  }
});
