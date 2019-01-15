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
      updateModal: false,
      removeModal: false
    };
  },

  render() {
    const filter = this.props.table.get('aliasFilter', Map());

    return (
      <div>
        {this.renderAliasFilterModal()}
        {filter.count() > 0 ? (
          <span>
            Where <b>{filter.get('column')}</b> {this.whereOperator(filter)} <b>{this.values(filter)}</b>
          </span>
        ) : (
          <span>No filter set</span>
        )}{' '}
        <Tooltip tooltip="Edit alias filter" placement="top">
          <Button bsSize="small" onClick={this.openUpdateModal}>
            <i className="fa fa-pencil-square-o" />
          </Button>
        </Tooltip>
        {filter.count() > 0 && (
          <span>
            {' '}
            <Tooltip tooltip="Remove filter" placement="top">
              <Button bsSize="small" onClick={this.openRemoveModal} disabled={this.props.removingAliasFilter}>
                {this.props.removingAliasFilter ? <Loader /> : <i className="fa fa-trash-o" />}
              </Button>
            </Tooltip>
            {this.renderDeleteModal()}
          </span>
        )}
      </div>
    );
  },

  renderAliasFilterModal() {
    return (
      <AliasFilterModal
        show={this.state.updateModal}
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
        show={this.state.removeModal}
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
      updateModal: true
    });
  },

  closeUpdateModal() {
    this.setState({
      updateModal: false
    });
  },

  openRemoveModal() {
    this.setState({
      removeModal: true
    });
  },

  closeRemoveModal() {
    this.setState({
      removeModal: false
    });
  },

  values(filter) {
    return filter.get('values').join(', ');
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
