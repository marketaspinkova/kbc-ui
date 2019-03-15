import PropTypes from 'prop-types';
import React from 'react';

import Tooltip from './../../../../react/common/Tooltip';
import {Loader} from '@keboola/indigo-ui';
import {Navigation} from 'react-router';

export default React.createClass({
  displayName: 'QueryDeleteButton',
  mixins: [Navigation],
  propTypes: {
    query: PropTypes.object.isRequired,
    configurationId: PropTypes.string.isRequired,
    isPending: PropTypes.bool.isRequired,
    tooltipPlacement: PropTypes.string,
    componentId: PropTypes.string,
    actionsProvisioning: PropTypes.object.isRequired,
    entityName: PropTypes.string
  },

  getDefaultProps() {
    return {
      tooltipPlacement: 'top',
      entityName: 'Query'
    };
  },

  deleteQuery(e) {
    e.preventDefault();
    e.stopPropagation();
    this.transitionTo(this.props.componentId, {config: this.props.configurationId});
    const ExDbActionCreators = this.props.actionsProvisioning.createActions(this.props.componentId);
    setTimeout(
      ExDbActionCreators.deleteQuery, null, this.props.configurationId, this.props.query.get('id')
    );
  },

  render() {
    let deleteLabel = 'Delete ' + this.props.entityName;
    if (this.props.isPending) {
      return (
        <span className="btn btn-link">
          <Loader/>
        </span>
      );
    } else {
      return (
        <Tooltip
          tooltip={deleteLabel}
          id="delete"
          placement={this.props.tooltipPlacement}
        >
          <button
            className="btn btn-link"
            onClick={this.deleteQuery}
          >
            <i className="kbc-icon-cup"/>
          </button>
        </Tooltip>
      );
    }
  }
});

