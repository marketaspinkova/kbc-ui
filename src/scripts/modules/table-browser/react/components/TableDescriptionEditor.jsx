import PropTypes from 'prop-types';
import React from 'react';
import InlineEditArea  from '../../../../react/common/InlineEditArea';
import MetadataEditField from '../../../components/react/components/MetadataEditField';

export default React.createClass({
  displayName: 'TableDescriptionEditor',

  propTypes: {
    tableId: PropTypes.string.isRequired,
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
          objectId={this.props.tableId}
          metadataKey="KBC.description"
          editElement={InlineEditArea}
          placeholder={this.props.placeholder}
        />
      </div>
    );
  }
});
