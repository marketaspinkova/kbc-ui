import React, { PropTypes } from 'react';
import { Map, List } from 'immutable';
import { Table, Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import { InlineEditInput } from '@keboola/indigo-ui';
import MetadataEditField from '../../../../components/react/components/MetadataEditField';
import InlineEditArea from '../../../../../react/common/InlineEditArea';
import SaveButtons from '../../../../../react/common/SaveButtons';

export default React.createClass({
  propTypes: {
    columnId: PropTypes.string.isRequired,
    columnName: PropTypes.string.isRequired,
    machineDataType: PropTypes.object.isRequired,
    userDataType: PropTypes.object.isRequired
  },

  getStateFromStores(props) {
    return {
      showLength: false,
      userType: props.userDataType
    }
  },

  baseTypeOptions() {
    const baseTypes = List(['STRING', 'INTEGER', "DATE", 'TIMESTAMP', 'BOOLEAN', 'FLOAT', 'DECIMAL']);
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
              value={this.state.userDataType.get('baseType')}
              options={this.baseTypeOptions()}
              onChange={this.handleBaseTypeChange}
            />
            {this.renderLengthEdit()}
            <SaveButtons
              isSaving={this.state.localState.getIn(['isSaving', this.props.columnId], false)}
              isChanged={this.state.localState.getIn(['isChanged', this.props.columnId], false)}
              onReset={this.handleResetDataType}
              onSave={this.handleSaveDataType}
              disabled={this.state.localState.getIn(['isSaving', this.props.columnId], false) || !this.state.isValid}
            />
          </Col>
        </Row>
      </Table>
    );
  },

  renderLengthEdit() {
    if (this.state.showLength) {
      return <MetadataEditField
        objectType="column"
        metadataKey="KBC.datatype.length"
        objectId={this.props.columnId}
        placeholder="Length"
        editElement={InlineEditInput}
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
    if (type === 'STRING') {
      return true;
    }
    return false;
  }
});
