import React from 'react';
import Markdown from './Markdown';

export default React.createClass({
  propTypes: {
    text: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    editTooltip: React.PropTypes.string,
    onCancel: React.PropTypes.func,
    onEditStart: React.PropTypes.func
  },

  render() {
    const { text, ...props } = this.props;

    return <div {...props}>{text ? this.renderText() : this.renderEdit()}</div>;
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
      <span>
        <div key="button-div" className="text-right">
          <button className="btn btn-link" onClick={this.props.onEditStart}>
            <span className="kbc-icon-pencil" /> {this.props.placeholder}
          </button>
        </div>
        <div key="markdown-div">
          <Markdown source={this.props.text} escapeHtml={true} />
        </div>
      </span>
    );
  }
});
