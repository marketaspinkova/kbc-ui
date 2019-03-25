import React, { PropTypes } from 'react';
import { Map, List } from 'immutable';
import { Table, Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import { InlineEditInput } from '@keboola/indigo-ui';
import MetadataEditField from '../../../../components/react/components/MetadataEditField';
import InlineEditArea from '../../../../../react/common/InlineEditArea';

export default React.createClass({
  propTypes: {
    columnId: PropTypes.string.isRequired,
    columnName: PropTypes.string.isRequired,
    machineColumnMetadata: PropTypes.object.isRequired,
    userColumnMetadata: PropTypes.object.isRequired
  },

  getInitialState: function() {
    return {
      showLength: false
    }
  },

  getUserValue(metadataKey) {
    return this.props.userColumnMetadata.get(this.props.columnName)
      .find(row => row.get('key') === metadataKey, null, Map())
      .get('value', '');
  },

  getMachineValue(metadataKey) {
    return Map({
      value: this.props.machineColumnMetadata.get(this.props.columnName)
        .find(row => row.get('key') === metadataKey, null, Map())
        .get('value', ''),
      provider: this.props.machineColumnMetadata.get(this.props.columnName)
        .find(row => row.get('key') === metadataKey, null, Map())
        .get('provider', ''),
    });
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
              value={this.getUserValue('KBC.datatype.basetype')}
              options={this.baseTypeOptions()}
              onChange={this.handleBaseTypeChange}
            />
            {this.renderLengthEdit()}
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
    const systemType = this.getMachineValue('KBC.datatype.basetype');
    if (systemType) {
      return (
        "via " + systemType.get('provider') + " we find " + systemType.get('value')
      )
    } else {
      return (
        "Unknown"
      )
    }
  },

  handleBaseTypeChange(selectedValue) {
    this.setState({showLength: this.baseTypeSupportsLength(selectedValue)});

  },

  baseTypeSupportsLength(type) {
    if (type === 'STRING') {
      return true;
    }
    return false;
  }
});
