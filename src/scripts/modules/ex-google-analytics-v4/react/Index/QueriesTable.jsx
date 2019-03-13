import PropTypes from 'prop-types';
import React from 'react';
// import {List} from 'immutable';
import StorageTableLink from '../../../components/react/components/StorageApiTableLinkEx';

import ActivateDeactivateButton from '../../../../react/common/ActivateDeactivateButton';
import RunExtractionButton from '../../../components/react/components/RunComponentButton';

import QueryDeleteButton from './QueryDeleteButton';

import {Link} from 'react-router';

import SelectedProfilesList from './SelectedProfilesList';

export default React.createClass({
  propTypes: {
    queries: PropTypes.object.isRequired,
    allProfiles: PropTypes.object.isRequired,
    localState: PropTypes.object.isRequired,
    updateLocalState: PropTypes.func.isRequired,
    prepareLocalState: PropTypes.func.isRequired,
    configId: PropTypes.string.isRequired,
    componentId: PropTypes.string.isRequired,
    outputBucket: PropTypes.string.isRequired,
    deleteQueryFn: PropTypes.func.isRequired,
    isPendingFn: PropTypes.func.isRequired,
    toggleQueryEnabledFn: PropTypes.func.isRequired,
    getRunSingleQueryDataFn: PropTypes.func.isRequired
  },

  render() {
    return (
      <div className="table table-striped table-hover">
        <div className="thead">
          <div className="tr">
            <div className="th">
              <strong>Name </strong>
            </div>
            <div className="th">
              <strong> Date Ranges </strong>
            </div>
            <div className="th">
              <strong> Selected Profile</strong>
            </div>
            <div className="th">
              {/* right arrow */}
            </div>
            <div className="th">
              <strong> Output Table </strong>
            </div>
            <div className="th">
              {/* action buttons */}
            </div>
          </div>
        </div>
        <div className="tbody kbc-break-all kbc-break-word">
          {this.props.queries.map((q, idx) => this.renderQueryRow(q, idx))}
        </div>
      </div>
    );
  },

  renderQueryRow(query, idx) {
    const propValue = (propName) => query.getIn([].concat(propName));
    const queryProfiles = propValue(['query', 'viewId']);
    const outTableId = this.props.outputBucket + '.' + propValue('outputTable');

    return (
      <Link
        key={idx}
        to={this.props.componentId + '-query-detail'}
        params={{
          config: this.props.configId,
          queryId: query.get('id')
        }}
        className="tr">
        <div className="td">
          {propValue('name')}
        </div>
        <div className="td">
          {this.renderDateRanges(propValue(['query', 'dateRanges']))}
        </div>
        <div className="td">
          <SelectedProfilesList
            allProfiles={this.props.allProfiles}
            profileIds={queryProfiles ? [queryProfiles] : null} />
        </div>
        <div className="td">
          <i className="kbc-icon-arrow-right" />
        </div>
        <div className="td">
          <StorageTableLink tableId={outTableId} />
        </div>
        <div className="td text-right kbc-no-wrap">
          <QueryDeleteButton
            query={query}
            onDeleteFn={() => this.props.deleteQueryFn(query.get('id'))}
            isPending={this.props.isPendingFn(['delete', query.get('id')])}
          />
          <ActivateDeactivateButton
            activateTooltip="Enable Query"
            deactivateTooltip="Disable Query"
            isActive={query.get('enabled')}
            isPending={this.props.isPendingFn(['toggle', query.get('id')])}
            onChange={() => this.handleToggleQuery(query)}
          />
          <RunExtractionButton
            title="Run Extraction"
            component={this.props.componentId}
            runParams={ () => {
              return {
                config: this.props.configId,
                configData: this.props.getRunSingleQueryDataFn(query.get('id'))
              };
            }}
          >
            You are about to run an extraction.
          </RunExtractionButton>

        </div>
      </Link>
    );
  },


  handleToggleQuery(query) {
    this.props.toggleQueryEnabledFn(query.get('id'));
  },

  renderDateRanges(ranges) {
    return (
      <span>
        <small>
          {ranges.map((r, idx) => {
            return (
              <div key={idx}>
                {r.get('startDate')} - {r.get('endDate')}
              </div>
            );
          })}
        </small>
      </span>
    );
  }

});
