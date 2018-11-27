import React from 'react';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import RoutesStore from '../../../../../stores/RoutesStore';
import TablesStore from '../../../../components/stores/StorageTablesStore';

export default React.createClass({
  mixins: [createStoreMixin(TablesStore)],

  getStateFromStores() {
    const bucketId = RoutesStore.getCurrentRouteParam('bucketId');
    const tableName = RoutesStore.getCurrentRouteParam('tableName');

    return {
      table: TablesStore.getAll().find(item => {
        return item.getIn(['bucket', 'id']) === bucketId && item.get('name') === tableName;
      })
    };
  },

  render() {
    if (!this.state.table) {
      return (
        <div className="kbc-inner-padding">
          <p>Table not found</p>
        </div>
      );
    }

    return (
      <div className="kbc-inner-padding">
        <h2>Table {this.state.table.get('name')}</h2>
      </div>
    );
  }
});
