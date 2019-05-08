import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import { Link } from 'react-router';
import { Check } from '@keboola/indigo-ui';

import QueryDeleteButton from '../../components/QueryDeleteButton';
import RunExtractionButton from '../../../../components/react/components/RunComponentButton';
import ActivateDeactivateButton from '../../../../../react/common/ActivateDeactivateButton';
import * as actionsProvisioning from '../../../actionsProvisioning';

export default createReactClass({
  mixins: [ImmutableRenderMixin],
  propTypes: {
    query: PropTypes.object.isRequired,
    pendingActions: PropTypes.object.isRequired,
    configurationId: PropTypes.string.isRequired,
    componentId: PropTypes.string.isRequired
  },
  handleActiveChange: function(newValue) {
    const actionCreators = actionsProvisioning.createActions(this.props.componentId);
    return actionCreators.changeQueryEnabledState(this.props.configurationId, this.props.query.get('id'), newValue);
  },
  render: function() {
    const actionCreators = actionsProvisioning.createActions(this.props.componentId);
    const { configurationId, query, pendingActions, componentId } = this.props;

    return (
      <Link
        className="tr"
        to="ex-mongodb-query"
        params={{
          config: configurationId,
          query: query.get('id')
        }}
      >
        <span className="td kbc-break-all">
          {query.get('name') ? query.get('name') : <span className="text-muted">Untitled</span>}
        </span>
        <span className="td">
          <Check isChecked={query.get('incremental', false)} />
        </span>
        <span className="td text-right kbc-no-wrap">
          <QueryDeleteButton
            query={query}
            configurationId={configurationId}
            isPending={pendingActions.get('deleteQuery')}
            componentId={componentId}
            actionsProvisioning={actionsProvisioning}
            entityName="Export"
          />
          <ActivateDeactivateButton
            activateTooltip="Enable Export"
            deactivateTooltip="Disable Export"
            isActive={query.get('enabled')}
            isPending={pendingActions.get('enabled')}
            onChange={this.handleActiveChange}
          />
          <RunExtractionButton
            title="Run Extraction"
            component={componentId}
            runParams={() => {
              return {
                config: configurationId,
                configData: actionCreators.prepareSingleQueryRunData(configurationId, query)
              };
            }}
          >
            You are about to run an extraction.
          </RunExtractionButton>
        </span>
      </Link>
    );
  }
});
