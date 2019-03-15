import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import ComponentConfigurationRowLink from '../../../../components/react/components/ComponentConfigurationRowLink';
import TransformationsStore from '../../../stores/TransformationsStore';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';

export default createReactClass({

  mixins: [createStoreMixin(TransformationsStore)],

  propTypes: {
    bucketId: PropTypes.string.isRequired,
    transformationId: PropTypes.string.isRequired,
    queryNumber: PropTypes.number.isRequired,
    onClick: PropTypes.func.isRequired,
    message: PropTypes.string.isRequired
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
