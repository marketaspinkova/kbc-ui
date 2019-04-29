import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Controlled as CodeMirror } from 'react-codemirror2'
import { ExternalLink } from '@keboola/indigo-ui';

export default createReactClass({
  propTypes: {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  render() {
    return (
      <div className="kbc-processor-edit">
        <div>
          <div className="edit form-group kbc-processor-editor">
            <CodeMirror
              editorDidMount={(editor) => editor.refresh()}
              value={this.props.value}
              onBeforeChange={this.handleChange}
              options={{
                theme: 'solarized',
                mode: 'application/json',
                lineNumbers: true,
                lineWrapping: true,
                lint: !!this.props.value,
                readOnly: this.props.disabled,
                gutters: ['CodeMirror-lint-markers'],
                placeholder: JSON.stringify({before: [], after: []}, null, 2)
              }}
            />
          </div>
          <div className="small help-block">
            Learn more about <ExternalLink href="https://developers.keboola.com/integrate/docker-runner/processors/">Processors</ExternalLink>
          </div>
        </div>
      </div>
    );
  },

  handleChange(editor, data, value) {
    this.props.onChange(value);
  }
});
