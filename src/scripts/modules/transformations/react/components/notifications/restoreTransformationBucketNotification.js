import PropTypes from 'prop-types';
import React from 'react';

import ConfigurationCopiedNotification
  from '../../../../components/react/components/ConfigurationCopiedNotification';

export default (bucketId, bucketName) => {
  return React.createClass({
    propTypes: {
      onClick: PropTypes.func.isRequired
    },
    render: function() {
      return (
        <ConfigurationCopiedNotification
          linkLabel="restored"
          componentId="transformation"
          message={'Bucket ' + bucketName + ' was '}
          configId={bucketId}
          onClick={this.props.onClick}
        />
      );
    }
  });
};
