import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import { Label } from 'react-bootstrap';
import classnames from 'classnames';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import { List } from 'immutable';

import {Link} from 'react-router';
import QueryDeleteButton from '../../components/QueryDeleteButton';
import RunExtractionButton from '../../../../components/react/components/RunComponentButton';
import SapiTableLinkEx from '../../../../components/react/components/StorageApiTableLinkEx';
import ActivateDeactivateSwitch from '../../../../../react/common/ActivateDeactivateSwitch';

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
        className={classnames('tr', { 'row-disabled': !this.props.query.get('enabled') })}
        to={link}
        params={{
          config: this.props.configurationId,
          query: this.props.query.get('id')
        }}
      >
        <span className="td kbc-break-all">{this.renderQueryName()}</span>
        <span className="td kbc-break-all">
          {this.props.query.get('table') ? (
            <span>
              {`${this.props.query.getIn(['table', 'schema'])}.${this.props.query.getIn(['table', 'tableName'])}`}
            </span>
          ) : (
            <Label>SQL</Label>
          )}
        </span>
        <span className="td kbc-break-all"><SapiTableLinkEx tableId={this.props.query.get('outputTable')}/></span>
        <span className="td">
          {this.props.query.get('primaryKey', List()).count() > 0 && (
            <span>
              <small>Primary Key:</small> {this.props.query.get('primaryKey', []).join(', ')}<br />
            </span>
          )}
          {this.props.query.get('incremental') && (
            <Label>Incremental</Label>
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
          <RunExtractionButton
            title="Run Extraction"
            component={this.props.componentId}
            runParams={() => {
              return runParams;
            }}
          >
            You are about to run extraction
          </RunExtractionButton>
          <ActivateDeactivateSwitch
            activateTooltip="Enable Query"
            deactivateTooltip="Disable Query"
            isActive={this.props.query.get('enabled')}
            isPending={this.props.pendingActions.get('enabled')}
            onChange={this.handleActiveChange}
          />
        </span>
      </Link>
    );
  }
});
