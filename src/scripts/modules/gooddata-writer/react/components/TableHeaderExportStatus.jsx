import React from 'react';
import createReactClass from 'create-react-class';
import { Loader } from '@keboola/indigo-ui';

import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import RoutesStore from '../../../../stores/RoutesStore';
import Tooltip from '../../../../react/common/Tooltip';

import goodDataWriterStore from '../../store';

export default createReactClass({
  mixins: [createStoreMixin(goodDataWriterStore)],

  componentWillReceiveProps() {
    return this.setState(this.getStateFromStores());
  },

  getStateFromStores() {
    const configId = RoutesStore.getCurrentRouteParam('config');
    const tableId = RoutesStore.getCurrentRouteParam('table');

    return {
      table: goodDataWriterStore.getTable(configId, tableId),
      configurationId: configId
    };
  },

  render() {
    let iconClass;
    if (this._isExported()) {
      iconClass = 'text-success';
    } else {
      iconClass = 'text-muted';
    }

    return (
      <small>
        <Tooltip tooltip={this._tooltip()}>
          <span className={`fa fa-upload ${iconClass}`} />
        </Tooltip>
        {this._loader()}
      </small>
    );
  },

  _loader() {
    const isSaving = this.state.table.get('savingFields').contains('isExported');
    const isReset = this.state.table.get('pendingActions').contains('resetTable');
    const isSync = this.state.table.get('pendingActions').contains('syncTable');
    if (isSaving || isReset || isSync) {
      return (
        <span>
          {' '}
          <Loader />
        </span>
      );
    }
  },

  _tooltip() {
    if (this._isExported()) {
      return 'Table is exported';
    } else {
      return 'Table is not exported';
    }
  },

  _isExported() {
    return this.state.table.getIn(['data', 'isExported']);
  }
});
