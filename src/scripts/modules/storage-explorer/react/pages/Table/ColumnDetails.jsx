import React, { PropTypes } from 'react';
import { Map, List } from 'immutable';
import { Table, Row, Col, FormControl, Checkbox } from 'react-bootstrap';
import Select from 'react-select';
import MetadataEditField from '../../../../components/react/components/MetadataEditField';
import InlineEditArea from '../../../../../react/common/InlineEditArea';
import SaveButtons from '../../../../../react/common/SaveButtons';
import { saveColumnMetadata } from '../../../Actions';

export default React.createClass({
  propTypes: {
    columnId: PropTypes.string.isRequired,
    columnName: PropTypes.string.isRequired,
    machineDataType: PropTypes.object.isRequired,
    userDataType: PropTypes.object.isRequired,
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      showLength: false
    }
  },

  baseTypeOptions() {
    const baseTypes = List(['STRING', 'INTEGER', "DATE", 'TIMESTAMP', 'BOOLEAN', 'FLOAT', 'NUMERIC']);
    return baseTypes.map(type => {
      return {label: type, value: type}
    }).toJS();
  },

  render() {
    return (
      <div>
        <MetadataEditField
          objectType="column"
          metadataKey="KBC.description"
          placeholder="Describe column"
          objectId={this.props.columnId}
          editElement={InlineEditArea}
        />
        {this.renderTypeForm()}
      </div>
    );
  },

  renderTypeForm() {
    return (
      <Table>
        <Row>
          <Col sm={4}>
            Datatype
          </Col>
          <Col sm={4}>
            {
              this.renderSystemValue()
            }
          </Col>
          <Col sm={4}>
            <Select
              value={this.props.userDataType.get('baseType')}
              options={this.baseTypeOptions()}
              onChange={this.handleBaseTypeChange}
            />
            {this.renderLengthEdit()}
            <Checkbox
              name={this.props.columnName + '_nullable'}
              checked={this.props.userDataType.get('nullable')}
              onChange={this.handleNullableChange}
            >
              Nullable
            </Checkbox>
            <SaveButtons
              onSave={this.handleSaveDataType}
              disabled={this.state.isDisabled || !this.state.isValid}
            />
          </Col>
        </Row>
      </Table>
    );
  },

  renderLengthEdit() {
    if (this.state.showLength) {
      return <FormControl
        name={this.props.columnName + '_length'}
        type="text"
        size={15}
        value={this.props.userDataType.get('length')}
        onChange={this.handleLengthChange}
        disabled={this.props.disabled || !this.lengthEnabled()}
        placeholder="Length, eg. 38,0"
      />
    }
  },

  renderSystemValue() {
    if (this.props.machineDataType !== null) {
      return (
        "via " + this.props.machineDataType.get('provider') + " we find " + this.props.machineDataType.get('baseType')
      )
    } else {
      return (
        "Unknown"
      )
    }
  },

  handleBaseTypeChange(selectedItem) {
    this.setState({
      showLength: this.baseTypeSupportsLength(selectedItem.value)
    });
  },

  baseTypeSupportsLength(type) {
    const typesSupportingLength = List(['STRING', 'INTEGER', 'NUMERIC']);
    if (typesSupportingLength.has(type)) {
      return true;
    }
    return false;
  },

  handleSaveDataType() {
    saveColumnMetadata('column', this.props.columnId, Map({
      'KBC.datatype.basetype': this.state.userDataType.get('baseType'),
      'KBC.datatype.length': this.state.userDataType.get('length'),
      'KBC.datatype.nullable': this.state.userDataType.get('nullable'),
    }));
  }
});
