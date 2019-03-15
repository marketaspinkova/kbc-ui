import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {Loader} from '@keboola/indigo-ui';
import {Map} from 'immutable';
import Tooltip from '../../../../react/common/Tooltip';
import Confirm from '../../../../react/common/Confirm';
import ActivateDeactivateButton from '../../../../react/common/ActivateDeactivateButton';
import RunButton from '../../../components/react/components/RunComponentButton';
import StorageTableLink from '../../../components/react/components/StorageApiTableLinkEx';
import TablesByBucketsPanel from '../../../components/react/components/TablesByBucketsPanel';
import {ExternalLink} from '@keboola/indigo-ui';

export default createReactClass({
  propTypes: {
    componentId: PropTypes.string.isRequired,
    configId: PropTypes.string.isRequired,
    inputTables: PropTypes.object.isRequired,
    items: PropTypes.object.isRequired,
    onDeleteFn: PropTypes.func.isRequired,
    onEditFn: PropTypes.func.isRequired,
    toggleEnabledFn: PropTypes.func.isRequired,
    isPendingFn: PropTypes.func.isRequired,
    getRunSingleDataFn: PropTypes.func.isRequired,
    searchQuery: PropTypes.string.isRequired,
    localState: PropTypes.object.isRequired,
    updateLocalState: PropTypes.func.isRequired,
    prepareLocalState: PropTypes.func.isRequired
  },

  render() {
    return (
      <TablesByBucketsPanel
        renderTableRowFn={this.renderRow}
        renderHeaderRowFn={this.renderHeaderRow}
        filterFn={this.filterBuckets}
        searchQuery={this.props.searchQuery}
        isTableExportedFn={(tableId) => this.props.items.filter((i) => i.get('tableId') === tableId).first()}
        onToggleBucketFn={this.handleToggleBucket}
        isBucketToggledFn={this.isBucketToggled}
        showAllTables={false}
        configuredTables={this.props.items.map((item) => item.get('tableId')).toJS()}
        renderDeletedTableRowFn={(table) => this.renderRowDeleted(table)}
      />
    );
  },

  handleToggleBucket(bucketId) {
    const bucketToggles = this.props.localState.get('bucketToggles', Map());
    return this.props.updateLocalState(['bucketToggles'], bucketToggles.set(bucketId, !bucketToggles.get(bucketId)));
  },

  isBucketToggled(bucketId) {
    const bucketToggles = this.props.localState.get('bucketToggles', Map());
    return !!bucketToggles.get(bucketId);
  },

  filterBuckets(buckets) {
    return buckets.filter((bucket) => {
      return bucket.get('stage') === 'out' || bucket.get('stage') === 'in';
    });
  },

  renderHeaderRow() {
    return (
      <div className="tr">
        <div className="th">
          <strong>Table Name</strong>
        </div>
        <div className="th">
          {/* right arrow */}
        </div>
        <div className="th">
          <strong>Spreadsheet / Sheet</strong>
        </div>
        <div className="th pull-right">
          {/* action buttons */}
        </div>
      </div>
    );
  },

  renderRow(table, index) {
    const item = this.props.items.filter((i) => i.get('tableId') === table.get('id')).first();
    return (
      <div key={index} className="tr">
        <div className="td">
          {this.renderFieldTable(item.get('tableId'))}
        </div>
        <div className="td">
          <i className="kbc-icon-arrow-right" />
        </div>
        <div className="td">
          {this.renderGoogleLink(item)}
        </div>
        <div className="td text-right kbc-no-wrap">
          {this.renderEditButton(item)}
          {this.renderDeleteButton(item)}
          {this.renderEnabledButton(item)}
          {this.renderRunButton(item)}
        </div>
      </div>
    );
  },

  renderRowDeleted(table, index) {
    const item = this.props.items.filter((i) => i.get('tableId') === table.get('id')).first();
    return (
      <div key={index} className="tr">
        <div className="td">
          {this.renderFieldTable(item.get('tableId'))}
        </div>
        <div className="td">
          <i className="kbc-icon-arrow-right" />
        </div>
        <div className="td">
          {this.renderGoogleLink(item)}
        </div>
        <div className="td text-right kbc-no-wrap">
          {this.renderDeleteButton(item)}
        </div>
      </div>
    );
  },

  renderFieldTable(tableId) {
    const configTables = this.props.inputTables.filter((t) => {
      return (t.get('id') === tableId);
    });

    if (configTables.count() === 0) return 'n/a';

    return (
      <StorageTableLink
        tableId={configTables.first().get('id')}
        linkLabel={configTables.first().get('name')}
      />
    );
  },

  renderFieldSpreadsheet(fileId) {
    return (<span>{fileId}</span>);
  },

  renderEditButton(item) {
    return (
      <button
        className="btn btn-link"
        onClick={() => this.props.onEditFn(1, item, false)}
      >
        <Tooltip tooltip="Edit" placement="top">
          <i className="kbc-icon-pencil" />
        </Tooltip>
      </button>
    );
  },

  renderDeleteButton(item) {
    const isPending = this.props.isPendingFn(['delete', item.get('id')]);
    if (isPending) {
      return <span className="btn btn-link"><Loader/></span>;
    }
    return (
      <Confirm
        title="Delete"
        text={`Do you really want to remove ${item.get('title')} from configuration?`}
        buttonLabel="Delete"
        onConfirm={() => this.props.onDeleteFn(item)}
      >
        <Tooltip placement="top" tooltip="Delete">
          <button className="btn btn-link">
            <i className="kbc-icon-cup" />
          </button>
        </Tooltip>
      </Confirm>
    );
  },

  renderEnabledButton(item) {
    return (
      <ActivateDeactivateButton
        activateTooltip="Enable"
        deactivateTooltip="Disable"
        isActive={item.get('enabled')}
        isPending={this.props.isPendingFn(item.get('id'))}
        onChange={() => this.props.toggleEnabledFn(item)}
      />
    );
  },

  renderRunButton(item) {
    return (
      <RunButton
        title="Run"
        component={this.props.componentId}
        runParams={ () => {
          return {
            config: this.props.configId,
            configData: this.props.getRunSingleDataFn(item.get('tableId'))
          };
        }}
      >
        You are about to upload {item.get('title')}
      </RunButton>
    );
  },

  renderGoogleLink(sheet) {
    const url = `https://docs.google.com/spreadsheets/d/${sheet.get('fileId')}/edit#gid=${sheet.get('sheetId')}`;
    return (
      <ExternalLink href={url}>
        {sheet.get('title')} / {sheet.get('sheetTitle')}
      </ExternalLink>
    );
  }
});
