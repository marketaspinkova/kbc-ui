import React from 'react';
import ComponentConfigurationRowLink from '../../../../components/react/components/ComponentConfigurationRowLink';
import TransformationsStore from '../../../stores/TransformationsStore';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';

export default React.createClass({
  mixins: [createStoreMixin(TransformationsStore)],

  propTypes: {
    error: React.PropTypes.object.isRequired,
    bucketId: React.PropTypes.string.isRequired,
    onQueryNumberClick: React.PropTypes.func.isRequired
  },

  getStateFromStores() {
    return {
      transformation: TransformationsStore.getTransformation(
        this.props.bucketId,
        this.props.error.get('transformation')
      )
    };
  },

  render() {
    const messageTitle = this._renderTitle();

    if (messageTitle) {
      return (
        <p>
          {messageTitle}
          <br />
          {this.props.error.get('message')}
        </p>
      );
    }

    return <p>{this.props.error.get('message')}</p>;
  },

  _renderTitle() {
    const name = this.state.transformation.get('name');
    const object = this.props.error.getIn(['object', 'id']);
    const errorType = this.props.error.getIn(['object', 'type']);

    if (errorType === 'query') {
      const queryNumber = parseInt(object, 10);

      return (
        <ComponentConfigurationRowLink
          componentId="transformation"
          configId={this.props.bucketId}
          rowId={this.state.transformation.get('id')}
          onClick={() => this.props.onQueryNumberClick(queryNumber)}
        >
          Transformation {name}, query #{object}
        </ComponentConfigurationRowLink>
      );
    }

    if (errorType === 'input') {
      return (
        <ComponentConfigurationRowLink
          componentId="transformation"
          configId={this.props.bucketId}
          rowId={this.state.transformation.get('id')}
        >
          Transformation {name}, input mapping of {object}
        </ComponentConfigurationRowLink>
      );
    }

    if (['output', 'output_consistency'].includes(errorType)) {
      return (
        <ComponentConfigurationRowLink
          componentId="transformation"
          configId={this.props.bucketId}
          rowId={this.state.transformation.get('id')}
        >
          Transformation {name}, output mapping of {object}
        </ComponentConfigurationRowLink>
      );
    }

    return null;
  }
});
