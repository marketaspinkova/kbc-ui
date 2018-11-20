import React from 'react';
import ComponentConfigurationRowLink from '../../../../components/react/components/ComponentConfigurationRowLink';
import TransformationsStore from '../../../stores/TransformationsStore';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';

export default React.createClass({

  mixins: [createStoreMixin(TransformationsStore)],

  propTypes: {
    bucketId: React.PropTypes.string.isRequired,
    transformationId: React.PropTypes.string.isRequired,
    tableId: React.PropTypes.string.isRequired,
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
          onClick={this.props.onClick}
        >
          Transformation {this.state.transformation.get('name')}, input mapping of {this.props.tableId}
        </ComponentConfigurationRowLink>
        <br />
        {this.props.message}
      </p>
    );
  }
});
