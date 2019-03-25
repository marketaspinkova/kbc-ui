import React, { PropTypes } from 'react';
import { Map } from 'immutable';
import { Table, Row, Col } from 'react-bootstrap';
import MetadataEditField from '../../../../components/react/components/MetadataEditField';
import InlineEditArea from '../../../../../react/common/InlineEditArea';

export default React.createClass({
  propTypes: {
    columnId: PropTypes.string.isRequired,
    columnName: PropTypes.string.isRequired,
    machineColumnMetadata: PropTypes.object.isRequired,
    userColumnMetadata: PropTypes.object.isRequired
  },

  getDescriptions: function() {
    var stuff = this.props.machineColumnMetadata
      .map(metadata => metadata
        .filter(metadata => metadata.get('key') === 'KBC.description', Map())
        .get('value', '')
      );
    return stuff;
  },

  render: function() {
    return (
      <div>
        <MetadataEditField
          objectType="column"
          metadataKey="KBC.description"
          placeholder="Describe column"
          objectId={this.props.columnId}
          editElement={InlineEditArea}
        />
        <Table>
          <Row>
            <Col>

            </Col>
            <Col>
              {this.props.machineColumnMetadata.get('provider', '')}
            </Col>
            <Col>
              User Defined
            </Col>
          </Row>
        </Table>
      </div>
    );
  },

  renderTypeForm: function() {

  }
});
