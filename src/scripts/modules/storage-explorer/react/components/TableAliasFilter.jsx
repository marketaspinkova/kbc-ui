import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Map } from 'immutable';
import { Button } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';

import Tooltip from '../../../../react/common/Tooltip';
import ConfirmModal from '../../../../react/common/ConfirmModal';
import AliasFilterModal from '../modals/AliasFilterModal';
import { setAliasTableFilter, removeAliasTableFilter } from '../../Actions';

export default createReactClass({
  propTypes: {
    table: PropTypes.object.isRequired,
    canEdit: PropTypes.bool.isRequired,
    settingAliasFilter: PropTypes.bool.isRequired,
    removingAliasFilter: PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      showUpdateModal: false,
      showRemoveModal: false
    };
  },

  render() {
    const filter = this.props.table.get('aliasFilter', Map());

    return (
      <div>
        {this.renderLabel(filter)}
        {this.renderEditButton(filter)}
        {this.renderDeleteButton(filter)}
      </div>
    );
  },

  renderLabel(filter) {
    if (!filter.count()) {
      return <span>No filter set</span>;
    }

    return (
      <span>
        Where <b>{filter.get('column')}</b> {this.whereOperator(filter)} <b>{filter.get('values').join(', ')}</b>
      </span>
    );
  },

  renderEditButton(filter) {
    if (!this.props.canEdit) {
      return null;
    }

    return (
      <span className="storage-inline-action">
        <Tooltip tooltip={filter.count() > 0 ? 'Edit filter' : 'Set filter'} placement="top">
          <Button
            bsSize="small"
            onClick={this.openUpdateModal}
            disabled={this.props.settingAliasFilter || this.props.removingAliasFilter}
          >
            {this.props.settingAliasFilter ? <Loader /> : <i className="fa fa-pencil-square-o" />}
          </Button>
        </Tooltip>
        {this.renderAliasFilterModal()}
      </span>
    );
  },

  renderDeleteButton(filter) {
    if (!this.props.canEdit || !filter.count()) {
      return null;
    }

    return (
      <span className="storage-inline-action">
        <Tooltip tooltip="Remove filter" placement="top">
          <Button
            bsSize="small"
            onClick={this.openRemoveModal}
            disabled={this.props.settingAliasFilter || this.props.removingAliasFilter}
          >
            {this.props.removingAliasFilter ? <Loader /> : <i className="fa fa-trash-o" />}
          </Button>
        </Tooltip>
        {this.renderDeleteModal()}
      </span>
    );
  },

  renderAliasFilterModal() {
    return (
      <AliasFilterModal
        key={this.props.table.get('lastChangeDate')}
        show={this.state.showUpdateModal}
        onSubmit={this.handleSubmit}
        onHide={this.closeUpdateModal}
        isSaving={this.props.settingAliasFilter}
        table={this.props.table}
      />
    );
  },

  renderDeleteModal() {
    return (
      <ConfirmModal
        show={this.state.showRemoveModal}
        onHide={this.closeRemoveModal}
        title="Remove alias filter"
        text={<p>Do you really want to remove the filter?</p>}
        buttonLabel="Delete"
        buttonType="danger"
        onConfirm={this.handleRemoveFilter}
      />
    );
  },

  handleSubmit(params) {
    const tableId = this.props.table.get('id');
    return setAliasTableFilter(tableId, params);
  },

  handleSetFilter(filterOptions) {
    const tableId = this.props.table.get('id');
    const params = {
      filterOptions
    };
    return setAliasTableFilter(tableId, params);
  },

  handleRemoveFilter() {
    const tableId = this.props.table.get('id');
    return removeAliasTableFilter(tableId);
  },

  openUpdateModal() {
    this.setState({
      showUpdateModal: true
    });
  },

  closeUpdateModal() {
    this.setState({
      showUpdateModal: false
    });
  },

  openRemoveModal() {
    this.setState({
      showRemoveModal: true
    });
  },

  closeRemoveModal() {
    this.setState({
      showRemoveModal: false
    });
  },

  whereOperator(filter) {
    const operator = filter.get('operator');
    const valuesCount = filter.get('values').count();

    if (operator === 'eq' && valuesCount <= 1) {
      return 'is';
    }

    if (operator === 'eq' && valuesCount > 1) {
      return 'in';
    }

    if (operator === 'ne' && valuesCount <= 1) {
      return 'is not';
    }

    return 'not in';
  }
});
