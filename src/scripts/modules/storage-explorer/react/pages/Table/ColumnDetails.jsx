import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Map, List } from 'immutable';
import { HelpBlock, Label, Col, FormGroup, FormControl, ControlLabel, Checkbox, Button } from 'react-bootstrap';
import Select from 'react-select';
import MetadataEditField from '../../../../components/react/components/MetadataEditField';
import InlineEditArea from '../../../../../react/common/InlineEditArea';
import { saveColumnMetadata } from '../../../Actions';

const baseTypes = List(['STRING', 'INTEGER', "DATE", 'TIMESTAMP', 'BOOLEAN', 'FLOAT', 'NUMERIC']);
const typesSupportingLength = List(['STRING', 'INTEGER', 'NUMERIC']);

export default createReactClass({
  propTypes: {
    columnId: PropTypes.string.isRequired,
    columnName: PropTypes.string.isRequired,
    machineDataType: PropTypes.object.isRequired,
    userDataType: PropTypes.object.isRequired
  },

  getInitialState() {
    return {
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
      <div>
        <h3>Datatype</h3>
        <div className="form-horizontal">
          <FormGroup>
            <Col componentClass={ControlLabel} xs={4}>
              System
            </Col>
            <Col xs={8}>
              {
                this.renderSystemValue()
              }
            </Col>
          </FormGroup>
        </div>
        <div className="form-horizontal">
          <HelpBlock>
            To override the system type:
          </HelpBlock>
          <FormGroup>
            <Col componentClass={ControlLabel} xs={4}>Type</Col>
            <Col xs={8}>
              <Select
                value={this.state.userDataType.get('baseType')}
                options={this.baseTypeOptions()}
                onChange={this.handleBaseTypeChange}
              />
            </Col>
          </FormGroup>
          {this.renderLengthEdit()}
          <FormGroup>
            <Col componentClass={ControlLabel} xs={4}>&nbsp;</Col>
            <Col xs={8}>
              <Checkbox
                name={this.props.columnName + '_nullable'}
                checked={this.state.userDataType.get('nullable')}
                onChange={this.handleNullableChange}
              >
                Nullable
              </Checkbox>
            </Col>
          </FormGroup>
          <Button
            onClick={this.handleSaveDataType}
          >Save</Button>
        </div>
      </div>
    );
  },

  renderLengthEdit() {
    if (this.lengthSupported()) {
      return (
        <FormGroup>
          <Col componentClass={ControlLabel} xs={4}>Length</Col>
          <Col xs={8}>
            <FormControl
              name={this.props.columnName + '_length'}
              type="text"
              value={this.state.userDataType.get('length')}
              onChange={this.handleLengthChange}
              placeholder="Length, eg. 38,0"
            />
          </Col>
        </FormGroup>
      )
    }
  },

  renderSystemValue() {
    if (this.props.machineDataType !== null) {
      return (
        <div>
          {this.props.machineDataType.get('baseType')}
          {this.props.machineDataType.get('length') ? '(' + this.props.machineDataType.get('length') + ')': ''}
          <br/>
          <Label bsStyle="info">{this.props.machineDataType.get('provider')}</Label>
        </div>
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
      userDataType: this.state.userDataType.set('baseType', selectedItem.value)
    });
  },

  lengthSupported() {
    if (typesSupportingLength.contains(this.state.userDataType.get('baseType'))) {
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
