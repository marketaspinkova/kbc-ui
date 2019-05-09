import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Markdown from './Markdown';

export default createReactClass({
  propTypes: {
    text: PropTypes.string,
    placeholder: PropTypes.string,
    onEditStart: PropTypes.func,
    collapsible: PropTypes.bool
  },

  render() {
    return (
      <div>
        <div className="text-right">
          <button className="btn btn-link" onClick={this.props.onEditStart}>
            <i className="kbc-icon-pencil" /> {this.props.placeholder}
          </button>
        </div>
        {this.props.text && <Markdown source={this.props.text} collapsible={this.props.collapsible}/>}
      </div>
    );
  }
});
