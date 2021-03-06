import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import moment from 'moment';
import { Map } from 'immutable';
import { Button } from 'react-bootstrap';
import formatCardinalNumber from '../../../../utils/formatCardinalNumber';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import RoutesStore from '../../../../stores/RoutesStore';
import TablesStore from '../../stores/StorageTablesStore';
import StorageActions from '../../StorageActionCreators';
import Tooltip from '../../../../react/common/Tooltip';
import FileSize from '../../../../react/common/FileSize';

export default createReactClass({
  mixins: [createStoreMixin(TablesStore)],

  propTypes: {
    tableId: PropTypes.string.isRequired,
    linkLabel: PropTypes.string,
    children: PropTypes.any
  },

  getStateFromStores() {
    return {
      table: TablesStore.getTable(this.props.tableId, Map())
    };
  },

  componentDidMount() {
    setTimeout(() => StorageActions.loadTables());
  },

  render() {
    return (
      <span key="mainspan">
        <Tooltip tooltip={this.renderTooltip()} placement="top">
          {this.renderBody()}
        </Tooltip>
      </span>
    );
  },

  renderBody() {
    const label = this.props.children || this.props.linkLabel || this.props.tableId;

    if (!this.state.table.count()) {
      return (
        <span className="text-muted">{label}</span>
      );
    }

    return (
      <Button
        bsStyle="link"
        className="btn-link-inline kbc-sapi-table-link"
        onClick={this.redirectToTablePage}
      >
        {label}
      </Button>
    )
  },

  renderTooltip() {
    if (!this.state.table.count()) {
      return 'Table does not exist.';
    }

    if (!this.state.table.get('lastChangeDate')) {
      return 'Table exists, but was never imported.';
    }

    return (
      <span>
        <div>{moment(this.state.table.get('lastChangeDate')).fromNow()}</div>
        <div>
          <FileSize size={this.state.table.get('dataSizeBytes')} />
        </div>
        <div>{formatCardinalNumber(this.state.table.get('rowsCount'))} rows</div>
      </span>
    );
  },

  redirectToTablePage(event) {
    event.preventDefault();
    event.stopPropagation();
    const path = RoutesStore.getRouterState().get('pathname');
    RoutesStore.getRouter().transitionTo(`${path}/tables/${this.props.tableId}`);
  }
});
