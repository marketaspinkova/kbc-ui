import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import ImmutableRenderMixin from 'react-immutable-render-mixin';

import {Link} from 'react-router';
import QueryDeleteButton from '../../components/QueryDeleteButton';
import RunExtractionButton from '../../../../components/react/components/RunComponentButton';
import SapiTableLinkEx from '../../../../components/react/components/StorageApiTableLinkEx';
import ActivateDeactivateButton from '../../../../../react/common/ActivateDeactivateButton';

import * as actionsProvisioning from '../../../actionsProvisioning';

export default createReactClass({
  displayName: 'QueryRow',
  mixins: [ImmutableRenderMixin],
  propTypes: {
    query: PropTypes.object.isRequired,
    pendingActions: PropTypes.object.isRequired,
    configurationId: PropTypes.string.isRequired,
    componentId: PropTypes.string.isRequired,
    isRowConfiguration: PropTypes.bool.isRequired
  },

  handleActiveChange(newValue) {
    const actionCreators = actionsProvisioning.createActions(this.props.componentId);
    return actionCreators.changeQueryEnabledState(this.props.configurationId, this.props.query.get('id'), newValue);
  },

  renderQueryName() {
    if (this.props.query.get('name')) {
      return this.props.query.get('name');
    } else {
      return (
        <span className="text-muted">Untitled</span>
      );
    }
  },

  render() {
    const actionCreators = actionsProvisioning.createActions(this.props.componentId);
    const link = 'ex-db-generic-' + this.props.componentId + '-query';
    const runParams = actionCreators.prepareSingleQueryRunData(this.props.configurationId, this.props.query, 'index');
    return (
      <Link
        className="tr"
        to={link}
        params={{
          config: this.props.configurationId,
          query: this.props.query.get('id')
        }}
      >
        <span className="td kbc-break-all">{this.renderQueryName()}</span>
        <span className="td kbc-break-all">
          {this.props.query.get('table') && (
            <small>
              {`${this.props.query.getIn(['table', 'schema'])}.${this.props.query.getIn(['table', 'tableName'])}`}
            </small>
          )}
        </span>
        <span className="td kbc-break-all"><SapiTableLinkEx tableId={this.props.query.get('outputTable')}/></span>
        <span className="td">
          {this.props.query.get('primaryKey', []).length > 0 && (
            <span>
              <small>Primary Key: {this.props.query.get('primaryKey', []).join(', ')}</small><br />
            </span>
          )}
          {this.props.query.get('incremental') && (
            <span className="label label-default">Incremental</span>
          )}
        </span>
        <span className="td text-right kbc-no-wrap">
          <QueryDeleteButton
            query={this.props.query}
            configurationId={this.props.configurationId}
            isPending={!!this.props.pendingActions.get('deleteQuery')}
            deleteFn={actionCreators.deleteQuery}
            componentId={this.props.componentId}
            actionsProvisioning={actionsProvisioning}
          />
          <ActivateDeactivateButton
            activateTooltip="Enable Query"
            deactivateTooltip="Disable Query"
            isActive={this.props.query.get('enabled')}
            isPending={this.props.pendingActions.get('enabled')}
            onChange={this.handleActiveChange}
          />
          <RunExtractionButton
            title="Run Extraction"
            component={this.props.componentId}
            runParams={() => {
              return runParams;
            }}
          >You are about to run an extraction</RunExtractionButton>
        </span>
      </Link>
    );
  }
});
