import React from 'react';
import { Loader } from '@keboola/indigo-ui';
import Graph from './Graph';
import TransformationsStore from '../../../stores/TransformationsStore';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import TransformationsActionCreators from '../../../ActionCreators';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export default React.createClass({
  mixins: [createStoreMixin(TransformationsStore), PureRenderMixin],

  propTypes: {
    bucketId: React.PropTypes.string.isRequired,
    transformationId: React.PropTypes.string.isRequired,
    disabled: React.PropTypes.bool.isRequired
  },

  getStateFromStores() {
    return {
      showDisabled: TransformationsStore.isShowDisabledInOverview(this.props.bucketId, this.props.transformationId),
      isLoading: TransformationsStore.isOverviewLoading(this.props.bucketId, this.props.transformationId),
      model: TransformationsStore.getOverview(this.props.bucketId, this.props.transformationId)
    };
  },

  componentDidMount() {
    return this._loadData();
  },

  render() {
    return (
      <div className="kb-graph">
        {this.state.isLoading ? (
          <div className="row text-center">
            <Loader />
          </div>
        ) : (
          this._renderNodes()
        )}
      </div>
    );
  },

  _renderNodes() {
    if (!this.state.model || this.state.model.get('nodes').count() === 0) {
      return <div className="row text-center">No nodes found.</div>;
    }

    return (
      <div>
        <Graph
          model={this.state.model}
          centerNodeId={this.props.bucketId + '.' + this.props.transformationId}
          disabledTransformation={this.props.disabled}
          showDisabled={this.state.showDisabled}
          showDisabledHandler={this._handleChangeShowDisabled}
        />
        <div className="help-block">
          {'Please note that the graph shows a maximum of 7 levels of nesting and the only '}
          supported writer is GoodData writer.
        </div>
      </div>
    );
  },

  _loadData() {
    return TransformationsActionCreators.loadTransformationOverview(
      this.props.bucketId,
      this.props.transformationId,
      this.state.showDisabled
    );
  },

  _handleChangeShowDisabled(val) {
    return TransformationsActionCreators.showTransformationOverviewDisabled(
      this.props.bucketId,
      this.props.transformationId,
      val
    );
  }
});
