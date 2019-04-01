import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Map, List } from 'immutable';
import { HelpBlock, Label, Col, FormGroup, FormControl, ControlLabel, Checkbox, Button } from 'react-bootstrap';
import Select from 'react-select';
import MetadataEditField from '../../../../components/react/components/MetadataEditField';
import InlineEditArea from '../../../../../react/common/InlineEditArea';
import { Loader } from '@keboola/indigo-ui';

import { saveColumnMetadata } from '../../../Actions';
import { DataTypeKeys } from '../../../../components/MetadataConstants';

const baseTypes = List(['STRING', 'INTEGER', "DATE", 'TIMESTAMP', 'BOOLEAN', 'FLOAT', 'NUMERIC']);
const typesSupportingLength = List(['STRING', 'INTEGER', 'NUMERIC']);

export default createReactClass({
  propTypes: {
    columnId: PropTypes.string.isRequired,
    columnName: PropTypes.string.isRequired,
    machineDataType: PropTypes.object.isRequired,
    userDataType: PropTypes.object.isRequired,
    deleteUserType: PropTypes.func.isRequired,
  },

  getInitialState() {
    return {
      userDataType: this.props.userDataType,
      isSaving: false,
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
            {
              this.renderSystemValue()
            }
          </FormGroup>
          <FormGroup>
            <Col componentClass={ControlLabel} xs={4}>Type</Col>
            <Col xs={8}>
              <Select
                value={this.state.userDataType.get(DataTypeKeys.BASE_TYPE)}
                options={this.baseTypeOptions()}
                onChange={this.handleBaseTypeChange}
              />
              <HelpBlock>Saving a blank type will remove the previously set type</HelpBlock>
            </Col>
          </FormGroup>
          {this.renderLengthEdit()}
          <FormGroup>
            <Col componentClass={ControlLabel} xs={4}>&nbsp;</Col>
            <Col xs={8}>
              <Checkbox
                name={this.props.columnName + '_nullable'}
                checked={this.state.userDataType.get(DataTypeKeys.NULLABLE)}
                onChange={this.handleNullableChange}
              >
                Nullable
              </Checkbox>
            </Col>
          </FormGroup>
          <FormGroup>
            <Col componentClass={ControlLabel} xs={4}>&nbsp;</Col>
            <Col xs={8}>
              <Button bsStyle="success" onClick={this.handleSaveDataType} disabled={this.state.isSaving}>
                {this.state.isSaving ? (
                  <span>
                    <Loader /> Saving...
                  </span>
                ) : (
                  <span>Save</span>
                )}
              </Button>
            </Col>
          </FormGroup>
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
              value={this.state.userDataType.get(DataTypeKeys.LENGTH)}
              onChange={this.handleLengthChange}
              placeholder="Length, eg. 38,0"
            />
          </Col>
        </FormGroup>
      )
    }
  },

  renderSystemValue() {
    if (this.props.machineDataType.count() > 0) {
      return (
        <FormGroup>
          <Col componentClass={ControlLabel} xs={4}>
            System
          </Col>
          <Col xs={8}>
            <div>
              {this.props.machineDataType.get(DataTypeKeys.BASE_TYPE)}
              {
                this.props.machineDataType.get(DataTypeKeys.LENGTH)
                  ? '(' + this.props.machineDataType.get(DataTypeKeys.LENGTH) + ')'
                  : ''
              }
              <br/>
              <Label bsStyle="info">{this.props.machineDataType.get('provider')}</Label>
            </div>
          </Col>
        </FormGroup>
      );
    }
  },

  handleLengthChange(e) {
    return this.setState({
      userDataType: this.state.userDataType.set(DataTypeKeys.LENGTH, e.target.value)
    })
  },

  handleNullableChange(e) {
    return this.setState({
      userDataType: this.state.userDataType.set(DataTypeKeys.NULLABLE, e.target.checked)
    })
  },

  handleBaseTypeChange(selectedItem) {
    return this.setState({
      userDataType: this.state.userDataType.set(DataTypeKeys.BASE_TYPE, selectedItem ? selectedItem.value : null)
    });
  },

  lengthSupported() {
    if (typesSupportingLength.contains(this.state.userDataType.get(DataTypeKeys.BASE_TYPE))) {
      return true;
    }
    return false;
  },

  handleSaveDataType() {
    this.setState({ isSaving: true });
    if (this.state.userDataType.get(DataTypeKeys.BASE_TYPE)) {
      saveColumnMetadata(
        this.props.columnId,
        Map(this.state.userDataType)
      ).finally(() => {
        this.setState({ isSaving: false })
      });
    } else {
      this.props.deleteUserType(
        this.props.columnName
      ).finally(() => {
        this.setState({ isSaving: false })
      });
    }
  }
});
