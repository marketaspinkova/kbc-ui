import React, { PropTypes } from 'react';
import { Map, List } from 'immutable';
import { Row, Col, FormControl, Checkbox, Button } from 'react-bootstrap';
import Select from 'react-select';
import MetadataEditField from '../../../../components/react/components/MetadataEditField';
import InlineEditArea from '../../../../../react/common/InlineEditArea';
import { saveColumnMetadata } from '../../../Actions';

const baseTypes = List(['STRING', 'INTEGER', "DATE", 'TIMESTAMP', 'BOOLEAN', 'FLOAT', 'NUMERIC']);
const typesSupportingLength = List(['STRING', 'INTEGER', 'NUMERIC']);

export default React.createClass({
  propTypes: {
    columnId: PropTypes.string.isRequired,
    columnName: PropTypes.string.isRequired,
    machineDataType: PropTypes.object.isRequired,
    userDataType: PropTypes.object.isRequired
  },

  getInitialState() {
    return {
      showLength: false,
      userDataType: this.props.userDataType
    }
  },

  baseTypeOptions() {
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
            value={this.state.userDataType.get('baseType')}
            options={this.baseTypeOptions()}
            onChange={this.handleBaseTypeChange}
          />
          {this.renderLengthEdit()}
          <Checkbox
            name={this.props.columnName + '_nullable'}
            checked={this.state.userDataType.get('nullable')}
            onChange={this.handleNullableChange}
          >
            Nullable
          </Checkbox>
          <Button
            onClick={this.handleSaveDataType}
          >Save</Button>
        </Col>
      </Row>
    );
  },

  renderLengthEdit() {
    if (this.state.showLength) {
      return <FormControl
        name={this.props.columnName + '_length'}
        type="text"
        size={15}
        value={this.state.userDataType.get('length')}
        onChange={this.handleLengthChange}
        disabled={!this.state.showLength}
        placeholder="Length, eg. 38,0"
      />
    }
  },

  renderSystemValue() {
    if (this.props.machineDataType !== null) {
      return (
        <span>
          From {this.props.machineDataType.get('provider')}
          we find {this.props.machineDataType.get('baseType')}
        </span>
      )
    } else {
      return (
        <span>Unknown</span>
      )
    }
  },

  handleLengthChange(e) {
    return this.setState({
      userDataType: this.state.userDataType.set('length', e.target.value)
    })
  },

  handleNullableChange(e) {
    return this.setState({
      userDataType: this.state.userDataType.set('nullable', e.target.checked)
    })
  },

  handleBaseTypeChange(selectedItem) {
    return this.setState({
      showLength: this.baseTypeSupportsLength(selectedItem.value),
      userDataType: this.state.userDataType.set('baseType', selectedItem.value)
    });
  },

  baseTypeSupportsLength(type) {
    if (typesSupportingLength.contains(type)) {
      return true;
    }
    return false;
  },

  handleSaveDataType() {
    saveColumnMetadata(this.props.columnId, Map({
      'KBC.datatype.basetype': this.state.userDataType.get('baseType'),
      'KBC.datatype.length': this.state.userDataType.get('length'),
      'KBC.datatype.nullable': this.state.userDataType.get('nullable', false),
    }));
  }
});
