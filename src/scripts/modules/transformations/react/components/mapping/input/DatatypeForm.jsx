import React from 'react';
import { Table, HelpBlock, Checkbox } from 'react-bootstrap';
import DatatypeFormRow from './DatatypeFormRow';
import { parseDataTypeFromString, isDataTypeAsString } from '../../../../utils/parseDataType';

const INITIAL_STATE = {
  convertToType: '',
  convertAll: false
};

export default React.createClass({
  propTypes: {
    datatypes: React.PropTypes.object.isRequired,
    columns: React.PropTypes.object.isRequired,
    datatypesMap: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
    sourceTable: React.PropTypes.string,
    disabled: React.PropTypes.bool
  },

  getInitialState() {
    return INITIAL_STATE;
  },

  componentDidUpdate(prevProps) {
    if (this.props.sourceTable !== prevProps.sourceTable) {
      this.resetState();
    }
  },

  render() {
    if (this.props.disabled) {
      return <HelpBlock>A source table must be selected to define data types.</HelpBlock>;
    }

    return (
      <Table striped hover>
        <thead>
          <tr>
            <th>Column</th>
            <th>
              Type{' '}
              <select value={this.state.convertToType} onChange={this.handleConvertToType}>
                <option disabled value="">
                  Set All Columns To
                </option>
                {this.props.datatypesMap
                  .map((type, index) => {
                    return (
                      <option value={type.get('name')} key={index}>
                        {type.get('name')}
                      </option>
                    );
                  })
                  .toArray()}
              </select>
            </th>
            <th>Length</th>
            <th>
              <Checkbox name="convertAll" checked={this.state.convertAll} onChange={this.handleConvertAllChange}>
                Set all empty values to <code>null</code>
              </Checkbox>
            </th>
          </tr>
        </thead>
        <tbody>{this.props.columns.map(this.renderColumn)}</tbody>
      </Table>
    );
  },

  renderColumn(column) {
    let columnDataType = this.props.datatypes.find((type, columnName) => {
      const computedName = typeof type === 'string' ? columnName : type.get('column');
      return computedName === column;
    });

    if (isDataTypeAsString(columnDataType)) {
      columnDataType = parseDataTypeFromString(columnDataType, column);
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

  handleDatatypeChange(newType) {
    this.props.onChange(this.props.datatypes.set(newType.get('column'), newType));
  },

  handleConvertAllChange(e) {
    this.setState({ convertAll: e.target.checked });
    this.props.onChange(
      this.props.datatypes.map(datatype => {
        return datatype.set('convertEmptyValuesToNull', e.target.checked);
      })
    );
  },

  handleConvertToType(e) {
    const selected = this.props.datatypesMap.find(datatype => datatype.get('name') === e.target.value);
    this.setState({ convertToType: selected.get('name') });
    this.props.onChange(
      this.props.datatypes.map(datatype => {
        return datatype.merge({
          type: selected.get('name'),
          length: selected.get('size') ? selected.get('maxLength') : null
        });
      })
    );
  },

  resetState() {
    this.setState(INITIAL_STATE);
  }
});
