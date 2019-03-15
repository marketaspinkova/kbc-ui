import React from 'react';
import createReactClass from 'create-react-class';
import Router from 'react-router';

import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import TransformationsStore from '../../../stores/TransformationsStore';
import TransformationBucketsStore from '../../../stores/TransformationBucketsStore';
import StorageTablesStore from '../../../../components/stores/StorageTablesStore';
import RoutesStore from '../../../../../stores/RoutesStore';
import GraphContainer from './GraphContainer';

export default createReactClass({
  mixins: [createStoreMixin(TransformationsStore, TransformationBucketsStore, StorageTablesStore), Router.Navigation],

  getStateFromStores() {
    const bucketId = RoutesStore.getCurrentRouteParam('config');
    const transformationId = RoutesStore.getCurrentRouteParam('row');

    return {
      bucket: TransformationBucketsStore.get(bucketId),
      transformation: TransformationsStore.getTransformation(bucketId, transformationId),
      pendingActions: TransformationsStore.getPendingActions(bucketId),
      tables: StorageTablesStore.getAll(),
      bucketId,
      transformationId,
      transformations: TransformationsStore.getTransformations(bucketId)
    };
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="kbc-main-content">
          <div className="kbc-row">
            <GraphContainer
              bucketId={this.state.bucketId}
              transformationId={this.state.transformationId}
              disabled={this.state.transformation.get('disabled', false)}
            />
          </div>
        </div>
      </div>
    );
  }
});
