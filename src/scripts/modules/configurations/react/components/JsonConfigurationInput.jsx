import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Controlled as CodeMirror } from 'react-codemirror2'

export default createReactClass({
  propTypes: {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  render() {
    return (
      <div className="kbc-json-edit">
        <div>
          <div className="edit form-group kbc-json-editor">
            <CodeMirror
              value={this.props.value}
              onBeforeChange={this.handleChange}
              options={{
                theme: 'solarized',
                mode: 'application/json',
                placeholder: 'Your JSON config goes here...',
                lineNumbers: true,
                lint: true,
                lineWrapping: true,
                readOnly: this.props.disabled,
                gutters: ['CodeMirror-lint-markers']
              }}
            />
          </div>
        </div>
      </div>
    );
  },

  handleChange(editor, data, value) {
    this.props.onChange(value);
  }
});
