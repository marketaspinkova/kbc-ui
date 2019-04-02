import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import { Link } from 'react-router';
import ApplicationStore from '../../../../../stores/ApplicationStore';
import ComponentsStore from '../../../stores/ComponentsStore';

export default (componentId, configId, latestVersion) => {
  const creatorId = latestVersion.getIn(['creatorToken', 'id']);
  const currentAdminId = ApplicationStore.getCurrentAdmin().get('id');
  const createdByCurrentAdmin = parseInt(creatorId, 10) === parseInt(currentAdminId, 10);

  return createReactClass({
    propTypes: {
      onClick: PropTypes.func.isRequired
    },

    render() {
      if (createdByCurrentAdmin) {
        return (
          <p>
            This configuration is also being edited by you from another place. Editing the same
            configuration from multiple places is not supported. If you save your changes here, you
            will overwrite the other changes. To see the latest changes, go to {this.renderLink()}.
          </p>
        );
      }

      return (
        <p>
          New changes by <b>{latestVersion.getIn(['creatorToken', 'description'])}</b> to this
          configuration were detected. Editing the same configuration by several users is not
          supported. If you save your changes, you will overwrite their changes. To see the latest
          changes, go to {this.renderLink()}.
        </p>
      );
    },

    renderLink() {
      if (componentId === 'orchestrator') {
        return (
          <Link
            to="orchestrator-versions"
            params={{ orchestrationId: configId }}
            onClick={this.props.onClick}
          >
            versions
          </Link>
        );
      }

      const component = ComponentsStore.getComponent(componentId);

      if (!component) {
        return 'versions';
      }

      return (
        <Link
          to={`${component.get('type')}-versions`}
          params={{
            component: componentId,
            config: configId
          }}
          onClick={this.props.onClick}
        >
          versions
        </Link>
      );
    }
  });
};
