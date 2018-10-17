import React from 'react';

export default React.createClass({
  propTypes: {
    error: React.PropTypes.object.isRequired,
    transformation: React.PropTypes.object.isRequired,
    onQueryNumberClick: React.PropTypes.func.isRequired
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
    const errorType = this.props.error.getIn(['object', 'type']);

    if (errorType === 'query') {
      const queryNumber = parseInt(this.props.error.getIn(['object', 'id']), 10);

      return (
        <a onClick={() => this.props.onQueryNumberClick(queryNumber)}>
          Transformation {this.props.transformation.get('name')}, query #{queryNumber}
        </a>
      );
    }

    if (errorType === 'input') {
      return (
        <span>
          Transformation {this.props.transformation.get('name')}, input mapping of{' '}
          {this.props.error.getIn(['object', 'id'])}
        </span>
      );
    }

    if (['output', 'output_consistency'].includes(errorType)) {
      return (
        <span>
          Transformation {this.props.transformation.get('name')}, output mapping of{' '}
          {this.props.error.getIn(['object', 'id'])}
        </span>
      );
    }

    return null;
  }
});
