import React from 'react';
import Markdown from './Markdown';

export default React.createClass({
  propTypes: {
    text: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    editTooltip: React.PropTypes.string,
    onEditStart: React.PropTypes.func,
    collapsible: React.PropTypes.bool
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
