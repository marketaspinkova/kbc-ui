import React from 'react';
import createReactClass from 'create-react-class';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import TransformationsStore from '../../../stores/TransformationsStore';
import RoutesStore from '../../../../../stores/RoutesStore';
import GraphContainer from './GraphContainer';

export default createReactClass({
  mixins: [createStoreMixin(TransformationsStore)],

  getStateFromStores() {
    const bucketId = RoutesStore.getCurrentRouteParam('config');
    const transformationId = RoutesStore.getCurrentRouteParam('row');

    return {
      bucketId,
      transformationId,
      transformation: TransformationsStore.getTransformation(bucketId, transformationId)
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
