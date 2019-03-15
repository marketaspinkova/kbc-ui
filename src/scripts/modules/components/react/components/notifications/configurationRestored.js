import PropTypes from 'prop-types';
import React from 'react';
import ConfigurationCopiedNotification from '../../components/ConfigurationCopiedNotification';

export default (componentId, configurationId, configuration) => {
  return React.createClass({
    propTypes: {
      onClick: PropTypes.func.isRequired
    },

    render: function() {
      return (<ConfigurationCopiedNotification
        message={'Configuration ' + (configuration.get('name')) + ' was '}
        linkLabel="restored"
        componentId={componentId}
        configId={configurationId}
        onClick={this.props.onClick}
      />
      );
    }
  });
};
