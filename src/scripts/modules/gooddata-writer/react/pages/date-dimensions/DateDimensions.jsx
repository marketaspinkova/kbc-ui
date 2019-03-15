import React from 'react';

import createReactClass from 'create-react-class';

import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import RoutesStore from '../../../../../stores/RoutesStore';

import goodDataWriterStore from '../../../store';
import dateDimensionsStore from '../../../dateDimensionsStore';
import actionCreators from '../../../actionCreators';
import DateDimensionsTable from './DateDimensionsTable';
import NewDimensionForm from './../../components/NewDimensionForm';

export default createReactClass({
  mixins: [createStoreMixin(dateDimensionsStore, goodDataWriterStore)],

  getStateFromStores() {
    const configurationId = RoutesStore.getCurrentRouteParam('config');
    const writer = goodDataWriterStore.getWriter(configurationId);

    return {
      dimensions: dateDimensionsStore.getAll(configurationId),
      isCreatingNewDimension: dateDimensionsStore.isCreatingNewDimension(configurationId),
      configurationId,
      newDimension: dateDimensionsStore.getNewDimension(configurationId),
      pid: writer.getIn(['config', 'project', 'id'])
    };
  },

  _handleNewDimensionSave() {
    return actionCreators.saveNewDateDimension(this.state.configurationId);
  },

  _handleNewDimensionUpdate(newDimension) {
    return actionCreators.updateNewDateDimension(this.state.configurationId, newDimension);
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="kbc-main-content">
          <div className="kbc-main-content-with-sidebar col-sm-8">
            <DateDimensionsTable
              pid={this.state.pid}
              dimensions={this.state.dimensions}
              configurationId={this.state.configurationId}
            />
          </div>
          <div className="col-sm-4">
            <NewDimensionForm
              isPending={this.state.isCreatingNewDimension}
              dimension={this.state.newDimension}
              onChange={this._handleNewDimensionUpdate}
              onSubmit={this._handleNewDimensionSave}
            />
          </div>
        </div>
      </div>
    );
  }
});
