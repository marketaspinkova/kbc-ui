import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Controlled as CodeMirror } from 'react-codemirror2'

export default createReactClass({
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
          onBeforeChange={this.handleChange}
          options={{
            theme: 'solarized',
            mode: 'application/json',
            lineNumbers: true,
            lineWrapping: true,
            readOnly: this.props.isSaving,
            lint: true,
            gutters: ['CodeMirror-lint-markers']
          }}
        />
      );
    }

    return (
      <CodeMirror
        value={this.props.data}
        options={{
          theme: 'solarized',
          mode: 'application/json',
          lineNumbers: true,
          readOnly: true,
          lineWrapping: true,
          cursorHeight: 0
        }}
      />
    );
  },

  handleChange(editor, data, value) {
    this.props.onChange(value);
  }
});
