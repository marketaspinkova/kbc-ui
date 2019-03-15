import PropTypes from 'prop-types';
import React from 'react';

export default React.createClass({
  propTypes: {
    componentId: PropTypes.string.isRequired,
    configId: PropTypes.string.isRequired,
    pending: PropTypes.bool.isRequired,
    actionsProvisioning: PropTypes.object.isRequired
  },

  migrateConfig() {
    const ExDbActionCreators = this.props.actionsProvisioning.createActions(this.props.componentId);
    ExDbActionCreators.migrateConfig(this.props.configId);
  },

  render() {
    return (
      <button
        className="btn btn-success"
        onClick={this.migrateConfig}
        disabled={this.props.pending}
      >
        Migrate Configuration
      </button>
    );
  }
});
