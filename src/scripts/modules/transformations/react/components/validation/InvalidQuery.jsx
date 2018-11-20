import React from 'react';
import ComponentConfigurationRowLink from '../../../../components/react/components/ComponentConfigurationRowLink';
import TransformationsStore from '../../../stores/TransformationsStore';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';

export default React.createClass({

  mixins: [createStoreMixin(TransformationsStore)],

  propTypes: {
    bucketId: React.PropTypes.string.isRequired,
    transformationId: React.PropTypes.string.isRequired,
    queryNumber: React.PropTypes.number.isRequired,
    onClick: React.PropTypes.func.isRequired,
    message: React.PropTypes.string.isRequired
  },

  getStateFromStores() {
    return {
      transformation: TransformationsStore.getTransformation(this.props.bucketId, this.props.transformationId)
    };
  },

  render() {
    return (
      <p>
        <ComponentConfigurationRowLink
          componentId="transformation"
          configId={this.props.bucketId}
          rowId={this.props.transformationId}
          query={{highlightQueryNumber: this.props.queryNumber}}
          onClick={this.props.onClick}
        >
          Transformation {this.state.transformation.get('name')}, query #{this.props.queryNumber}
        </ComponentConfigurationRowLink>
        <br />
        {this.props.message}
      </p>
    );
  }
});
