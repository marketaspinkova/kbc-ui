import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Markdown from './Markdown';

export default createReactClass({
  propTypes: {
    text: PropTypes.string,
    placeholder: PropTypes.string,
    editTooltip: PropTypes.string,
    onEditStart: PropTypes.func,
    collapsible: PropTypes.bool
  },

  render() {
    return <div>{this.props.text ? this.renderText() : this.renderEdit()}</div>;
  },

  renderEdit() {
    return (
      <div className="text-right">
        <button className="btn btn-link" onClick={this.props.onEditStart}>
          <span className="kbc-icon-pencil" /> {this.props.placeholder}
        </button>
      </div>
    );
  },

  renderText() {
    return (
      <div>
        <div className="text-right">
          <button className="btn btn-link" onClick={this.props.onEditStart}>
            <span className="kbc-icon-pencil" /> {this.props.placeholder}
          </button>
        </div>
        <div>
          <Markdown source={this.props.text} collapsible={this.props.collapsible}/>
        </div>
      </div>
    );
  }
});
