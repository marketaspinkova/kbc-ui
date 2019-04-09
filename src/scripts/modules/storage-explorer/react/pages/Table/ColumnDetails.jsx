import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Map, fromJS, List } from 'immutable';
import { FormControl, Checkbox, Button } from 'react-bootstrap';
import Select from 'react-select';
import MetadataEditField from '../../../../components/react/components/MetadataEditField';
import InlineEditArea from '../../../../../react/common/InlineEditArea';
import { Loader } from '@keboola/indigo-ui';

import { DataTypeKeys, BaseTypes } from '../../../../components/MetadataConstants';
import ComponentName from '../../../../../react/common/ComponentName';
import ComponentIcon from '../../../../../react/common/ComponentIcon';
import ComponentsStore from '../../../../components/stores/ComponentsStore';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';

const typesSupportingLength = List(['STRING', 'INTEGER', 'NUMERIC']);

const isLengthSupported = (type) => {
  return typesSupportingLength.contains(type);
};

export default createReactClass({
  mixins: [createStoreMixin(ComponentsStore)],

  propTypes: {
    columnId: PropTypes.string.isRequired,
    columnName: PropTypes.string.isRequired,
    machineDataType: PropTypes.object.isRequired,
    userDataType: PropTypes.object.isRequired,
    deleteUserType: PropTypes.func.isRequired,
    saveUserType: PropTypes.func.isRequired,
  },

  getStateFromStores() {
    return {
      machineDataTypeComponent: this.props.machineDataType.count() > 0
        ? ComponentsStore.getComponent(this.props.machineDataType.get('provider'))
        : Map()
    };
  },

  getInitialState() {
    return {
      userDataType: this.props.userDataType,
      isSaving: false,
    }
  },

  componentDidUpdate(prevProps) {
    if (!prevProps.userDataType.equals(this.props.userDataType)) {
      this.setState({ userDataType: this.props.userDataType });
    }
  },

  baseTypeOptions() {
    return fromJS(BaseTypes).map(type => {
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
        <h3>Data types</h3>
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th><strong>Provider</strong></th>
              <th style={{minWidth: '160px'}}><strong>Type</strong></th>
              <th><strong>Length</strong></th>
              <th><strong>Nullable</strong></th>
            </tr>
          </thead>
          <tbody>
            {this.renderSystemValue()}
            <tr>
              <td>User</td>
              <td>
                <Select
                  value={this.state.userDataType.get(DataTypeKeys.BASE_TYPE)}
                  options={this.baseTypeOptions()}
                  onChange={this.handleBaseTypeChange}
                />
              </td>
              <td>
                {this.renderLengthEdit()}
              </td>
              <td>
                {this.state.userDataType.get(DataTypeKeys.BASE_TYPE) && (
                  <Checkbox
                    name={this.props.columnName + '_nullable'}
                    checked={this.state.userDataType.get(DataTypeKeys.NULLABLE, false)}
                    onChange={this.handleNullableChange}
                  >
                    Nullable
                  </Checkbox>
                )}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} className="text-right">
                <Button bsStyle="success" onClick={this.handleSaveDataType} disabled={this.isDisabled()}>
                  {this.state.isSaving ? (
                    <span><Loader /> Saving...</span>
                  ) : (
                    <span>Save</span>
                  )}
                </Button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  },

  renderLengthEdit() {
    if (isLengthSupported(this.state.userDataType.get(DataTypeKeys.BASE_TYPE))) {
      return (
        <FormControl
          name={this.props.columnName + '_length'}
          type="text"
          value={this.state.userDataType.get(DataTypeKeys.LENGTH, '')}
          onChange={this.handleLengthChange}
          placeholder="Length, eg. 38,0"
        />
      )
    }
  },

  renderSystemValue() {
    if (this.props.machineDataType.count() > 0) {
      return (
        <tr>
          <td>
            <ComponentIcon component={this.state.machineDataTypeComponent} size="32" resizeToSize="16" />
            <ComponentName component={this.state.machineDataTypeComponent} showType />
          </td>
          <td>{this.props.machineDataType.get(DataTypeKeys.BASE_TYPE)}</td>
          <td>{this.props.machineDataType.get(DataTypeKeys.LENGTH) && (
            this.props.machineDataType.get(DataTypeKeys.LENGTH)
          )}</td>
          <td>{this.props.machineDataType.get(DataTypeKeys.NULLABLE) ? (
            <i className="fa fa-check" />
          ): (
            <i className="fa fa-times" />
          )}</td>
        </tr>
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
    if (!selectedItem) {
      this.setState({
        userDataType: this.state.userDataType
          .delete(DataTypeKeys.BASE_TYPE)
          .delete(DataTypeKeys.LENGTH)
          .delete(DataTypeKeys.NULLABLE)
      });
    } else if (!isLengthSupported(selectedItem.value)) {
      this.setState({
        userDataType: this.state.userDataType
          .set(DataTypeKeys.LENGTH, "")
          .set(DataTypeKeys.BASE_TYPE, selectedItem.value)
      })
    } else {
      this.setState({
        userDataType: this.state.userDataType.set(DataTypeKeys.BASE_TYPE, selectedItem.value)
      });
    }
  },

  isDisabled() {
    return this.state.isSaving || this.props.userDataType.equals(this.state.userDataType);
  },

  handleSaveDataType() {
    this.setState({ isSaving: true });
    if (this.state.userDataType.get(DataTypeKeys.BASE_TYPE)) {
      if (this.state.userDataType.get(DataTypeKeys.LENGTH) === "") {
        this.setState({
          userDataType: this.state.userDataType.delete(DataTypeKeys.LENGTH)
        });
      }
      this.props.saveUserType(
        this.props.columnName,
        this.state.userDataType
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
