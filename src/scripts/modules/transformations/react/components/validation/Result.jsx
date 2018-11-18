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

    if (messageTitle) {
      return (
        <div style={{ marginBottom: '15px' }}>
          {messageTitle}
          <br />
          {this.renderMessage()}
        </div>
      );
    }

    return <div>{this.renderMessage()}</div>;
  },

  renderMessage() {
    const message = this.props.error.get('message', '');

    if (!endsWith(message, '^')) {
      return message;
    }

    const [errorMessage, codeBlock] = message
      .replace(/\n\r/g, '\n')
      .replace(/\r/g, '\n')
      .split(/\n{2,}/g);

    return (
      <span>
        <span>{errorMessage}</span>
        {codeBlock && <pre>{codeBlock}</pre>}
      </span>
    );
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
