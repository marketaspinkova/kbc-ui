import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Map } from 'immutable';
import { Table, FormControl, Checkbox, Button } from 'react-bootstrap';
import Select from 'react-select';
import MetadataEditField from '../../../../components/react/components/MetadataEditField';
import InlineEditArea from '../../../../../react/common/InlineEditArea';
import { Loader } from '@keboola/indigo-ui';

import { DataTypeKeys, BaseTypes } from '../../../../components/MetadataConstants';
import { validate as isValid } from '../../../../components/utils/columnTypeValidation';
import ComponentName from '../../../../../react/common/ComponentName';
import ComponentIcon from '../../../../../react/common/ComponentIcon';
import ComponentsStore from '../../../../components/stores/ComponentsStore';

const isLengthSupported = (type) => {
  return ['STRING', 'INTEGER', 'NUMERIC'].includes(type);
};

export default createReactClass({
  propTypes: {
    table: PropTypes.object.isRequired,
    columnId: PropTypes.string.isRequired,
    columnName: PropTypes.string.isRequired,
    machineDataType: PropTypes.object.isRequired,
    userDataType: PropTypes.object.isRequired,
    deleteUserType: PropTypes.func.isRequired,
    saveUserType: PropTypes.func.isRequired,
  },

  getInitialState() {
    return {
      component: ComponentsStore.getComponent(this.props.machineDataType.get('provider')) || Map(),
      userDataType: this.props.userDataType,
      isSaving: false,
    }
  },

  componentDidUpdate(prevProps) {
    if (!prevProps.userDataType.equals(this.props.userDataType)) {
      this.setState({ userDataType: this.props.userDataType });
    }
  },

  render() {
    return (
      <div>
        <MetadataEditField
          objectType="column"
          objectId={this.props.columnId}
          metadata={this.props.table.getIn(['columnMetadata', this.props.columnName], Map())}
          metadataKey="KBC.description"
          placeholder="Describe column"
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
        <p>
          To set a custom data type or to override the data type set by the
          system fill the form below. Saving a blank type will remove the
          previously set user-defined type.
        </p>
        <Table striped hover responsive>
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
                  options={BaseTypes.map(type => ({ label: type, value: type }))}
                  onChange={this.handleBaseTypeChange}
                />
              </td>
              <td>
                {this.renderLengthEdit()}
              </td>
              <td>
                {this.state.userDataType.get(DataTypeKeys.BASE_TYPE) && (
                  <Checkbox
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
        </Table>
      </div>
    );
  },

  renderLengthEdit() {
    if (!isLengthSupported(this.state.userDataType.get(DataTypeKeys.BASE_TYPE))) {
      return null;
    }

    return (
      <FormControl
        type="text"
        value={this.state.userDataType.get(DataTypeKeys.LENGTH, '')}
        onChange={this.handleLengthChange}
        placeholder={this.state.userDataType.get(DataTypeKeys.BASE_TYPE) === 'STRING'
          ? 'Length, eg. 255'
          : 'Length, eg. 38,0'
        }
      />
    );
  },

  renderSystemValue() {
    if (!this.props.machineDataType.count()) {
      return null;
    }

    return (
      <tr>
        <td>
          <ComponentIcon component={this.state.component} size="32" resizeToSize="16" />
          <ComponentName component={this.state.component} showType />
        </td>
        <td>{this.props.machineDataType.get(DataTypeKeys.BASE_TYPE)}</td>
        <td>
          {this.props.machineDataType.has(DataTypeKeys.LENGTH) && (
            this.props.machineDataType.get(DataTypeKeys.LENGTH)
          )}
        </td>
        <td>
          {this.props.machineDataType.get(DataTypeKeys.NULLABLE) ? (
            <i className="fa fa-check" />
          ) : (
            <i className="fa fa-times" />
          )}
        </td>
      </tr>
    );
  },

  handleLengthChange(e) {
    if (e.target.value) {
      this.setState({ userDataType: this.state.userDataType.set(DataTypeKeys.LENGTH, e.target.value) })
    } else {
      this.setState({ userDataType: this.state.userDataType.delete(DataTypeKeys.LENGTH) })
    }
  },

  handleNullableChange(e) {
    this.setState({
      userDataType: this.state.userDataType.set(DataTypeKeys.NULLABLE, e.target.checked)
    })
  },

  handleBaseTypeChange(selectedItem) {
    if (!selectedItem) {
      this.setState({ userDataType: Map() });
    } else if (!isLengthSupported(selectedItem.value)) {
      this.setState({
        userDataType: this.state.userDataType
          .set(DataTypeKeys.BASE_TYPE, selectedItem.value)
          .delete(DataTypeKeys.LENGTH)
      })
    } else {
      this.setState({
        userDataType: this.state.userDataType.set(DataTypeKeys.BASE_TYPE, selectedItem.value)
      });
    }
  },

  isDisabled() {
    const { userDataType } = this.state;

    if (this.props.userDataType.equals(userDataType)) {
      return true;
    }

    if (
      userDataType.get(DataTypeKeys.LENGTH) &&
      !isValid(userDataType.get(DataTypeKeys.BASE_TYPE), userDataType.get(DataTypeKeys.LENGTH))
    ) {
      return true;
    }

    return this.state.isSaving;
  },

  handleSaveDataType() {
    this.setState({ isSaving: true });
    if (this.state.userDataType.get(DataTypeKeys.BASE_TYPE)) {
      this.props.saveUserType(this.props.columnName, this.state.userDataType).finally(() => {
        this.setState({ isSaving: false })
      });
    } else {
      this.props.deleteUserType(this.props.columnName).finally(() => {
        this.setState({ isSaving: false })
      });
    }
  }
});
