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

  render: function() {
    return (
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
        <Row>
          <Col>
            Description
          </Col>
          <Col>
            {this.props.machineColumnMetadata.find(metadata => metadata.get('key') === 'KBC.description', Map()).get('value', '')}
          </Col>
          <Col>
            <MetadataEditField
              objectType="column"
              metadataKey="KBC.description"
              placeholder="Describe column"
              objectId={this.props.columnId}
              editElement={InlineEditArea}
            />
          </Col>
        </Row>
      </Table>
    );
  }
});
