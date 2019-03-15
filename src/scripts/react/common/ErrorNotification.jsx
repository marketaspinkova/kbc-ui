import PropTypes from 'prop-types';
import React from 'react';

import createReactClass from 'create-react-class';

export default createReactClass({

  propTypes: {
    error: PropTypes.object.isRequired
  },

  render() {
    var title = this.props.error.getTitle();
    if (!title || title === '') {
      title = 'Error';
    }
    return (
      <span>
        <div>
          {title}
          {this.renderText()}
          {this.renderExceptionId()}
        </div>
      </span>
    );
  },

  renderText() {
    if (this.props.error.getText()) {
      return (<div>{this.props.error.getText()}</div>);
    }
  },

  renderExceptionId() {
    if (this.props.error.getExceptionId()) {
      return (
        <div>
          <span className="fa fa-fw fa-warning" />
          {this.props.error.getExceptionId()}
        </div>
      );
    }
  }
});
