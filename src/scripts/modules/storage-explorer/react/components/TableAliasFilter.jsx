import React, { PropTypes } from 'react';
import { Map } from 'immutable';
import { Button } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';

import StorageActionCreators from '../../../components/StorageActionCreators';
import Tooltip from '../../../../react/common/Tooltip';
import ConfirmModal from '../../../../react/common/ConfirmModal';
import AliasFilterModal from '../modals/AliasFilterModal';

export default React.createClass({
  propTypes: {
    table: PropTypes.object.isRequired,
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
    return (
      <span style={{ marginLeft: '5px' }}>
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
    if (!filter.count()) {
      return null;
    }

    return (
      <span style={{ marginLeft: '5px' }}>
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
        text={<p>Do you really want to remove filter?</p>}
        buttonLabel="Delete"
        buttonType="danger"
        onConfirm={this.handleRemoveFilter}
      />
    );
  },

  handleSubmit(params) {
    const tableId = this.props.table.get('id');
    return StorageActionCreators.setAliasTableFilter(tableId, params);
  },

  handleSetFilter(filterOptions) {
    const tableId = this.props.table.get('id');
    const params = {
      filterOptions
    };
    return StorageActionCreators.setAliasTableFilter(tableId, params);
  },

  handleRemoveFilter() {
    const tableId = this.props.table.get('id');
    return StorageActionCreators.removeAliasTableFilter(tableId);
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
