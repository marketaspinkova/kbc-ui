import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import { List } from 'immutable';
import InlineEditArea  from '../../../../react/common/InlineEditArea';
import MetadataEditField from '../../../components/react/components/MetadataEditField';

export default createReactClass({
  propTypes: {
    table: PropTypes.object.isRequired,
    placeholder: PropTypes.string
  },

  getDefaultProps: function() {
    return {
      placeholder: 'Describe this table'
    };
  },

  render() {
    return (
      <div className="kbc-metadata-description">
        <MetadataEditField
          objectType="table"
          objectId={this.props.table.get('id')}
          metadata={this.props.table.get('metadata', List())}
          metadataKey="KBC.description"
          placeholder={this.props.placeholder}
          editElement={InlineEditArea}
        />
      </div>
    );
  }
});
