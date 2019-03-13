import PropTypes from 'prop-types';
import React from 'react';
import CodeMirror from 'react-code-mirror';

export default React.createClass({
  propTypes: {
    data: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    isSaving: PropTypes.bool,
    isEditing: PropTypes.bool
  },

  render() {
    return (
      <span>
        {this.renderCodeMirror()}
      </span>
    );
  },

  renderCodeMirror() {
    if (this.props.isEditing) {
      return (
        <CodeMirror
          value={this.props.data}
          theme="solarized"
          lineNumbers={true}
          mode="application/json"
          autofocus={true}
          lineWrapping={true}
          onChange={this.handleChange}
          readOnly={this.props.isSaving}
          lint={true}
          gutters={['CodeMirror-lint-markers']}
        />
      );
    } else {
      return (
        <CodeMirror
          theme="solarized"
          lineNumbers={true}
          defaultValue={this.props.data}
          readOnly={true}
          cursorHeight={0}
          mode="application/json"
          lineWrapping={true}
        />
      );
    }
  },

  handleChange(e) {
    const value = e.target.value;
    this.props.onChange(value);
  }
});
