import React from 'react';
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

export default React.createClass({
  mixins: [createStoreMixin(TablesStore)],

  propTypes: {
    tableId: React.PropTypes.string.isRequired,
    linkLabel: React.PropTypes.string,
    children: React.PropTypes.any
  },

  getStateFromStores() {
    return {
      table: TablesStore.get(this.props.tableId, Map())
    };
  },

  componentDidMount() {
    setTimeout(() => StorageActions.loadTables());
  },

  render() {
    return <span key="mainspan">{this.renderLink()}</span>;
  },

  renderLink() {
    return (
      <Tooltip tooltip={this.renderTooltip()} placement="top">
        <Button
          bsStyle="link"
          className="btn-link-inline kbc-sapi-table-link"
          onClick={this.redirectToTablePage}
        >
          {this.props.children || this.props.linkLabel || this.props.tableId}
        </Button>
      </Tooltip>
    );
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
