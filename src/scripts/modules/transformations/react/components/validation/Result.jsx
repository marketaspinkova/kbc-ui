import React from 'react';
import { endsWith } from 'underscore.string';
import ComponentConfigurationRowLink from '../../../../components/react/components/ComponentConfigurationRowLink';
import TransformationsStore from '../../../stores/TransformationsStore';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';

export default React.createClass({
  mixins: [createStoreMixin(TransformationsStore)],

  propTypes: {
    error: React.PropTypes.object.isRequired,
    bucketId: React.PropTypes.string.isRequired,
    onErrorMessageClick: React.PropTypes.func.isRequired
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
    const messageTitle = this.renderTitle();
    const message = endsWith(this.props.error.get('message'), '^') ? (
      <pre>{this.props.error.get('message')}</pre>
    ) : (
      this.props.error.get('message')
    );

    if (messageTitle) {
      return (
        <div>
          {messageTitle}
          <br />
          {message}
        </div>
      );
    }

    return <div>{message}</div>;
  },

  renderTitle() {
    const name = this.state.transformation.get('name');
    const object = this.props.error.getIn(['object', 'id']);
    const errorType = this.props.error.getIn(['object', 'type']);

    if (errorType === 'query') {
      const lineNumber = parseInt(object, 10);

      return (
        <ComponentConfigurationRowLink
          componentId="transformation"
          configId={this.props.bucketId}
          rowId={this.state.transformation.get('id')}
          onClick={() => this.props.onErrorMessageClick(lineNumber)}
        >
          <b>
            Transformation {name}, query #{object}
          </b>
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
          <b>
            Transformation {name}, input mapping of {object}
          </b>
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
          <b>
            Transformation {name}, output mapping of {object}
          </b>
        </ComponentConfigurationRowLink>
      );
    }

    return null;
  }
});
