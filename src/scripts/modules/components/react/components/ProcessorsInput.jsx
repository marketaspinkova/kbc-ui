import React, {PropTypes} from 'react';
import CodeMirror from 'react-code-mirror';
import { ExternalLink } from '@keboola/indigo-ui';

export default React.createClass({
  propTypes: {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  componentWillUpdate(nextProps) {
    if (this.refs.CodeMirror) {
      if (nextProps.value === '') {
        this.refs.CodeMirror.editor.setOption('lint', false);
      } else {
        this.refs.CodeMirror.editor.setOption('lint', true);
      }
    }
  },

  render() {
    var codeMirrorParams = {
      ref: 'CodeMirror',
      value: this.props.value,
      theme: 'solarized',
      lineNumbers: true,
      mode: 'application/json',
      autofocus: true,
      lineWrapping: true,
      onChange: this.handleChange,
      readOnly: this.props.disabled,
      lint: false,
      gutters: ['CodeMirror-lint-markers'],
      placeholder: JSON.stringify({before: [], after: []}, null, 2)
    };
    return (
      <div className="kbc-processor-edit">
        <div>
          <div className="edit form-group kbc-processor-editor">
            <CodeMirror {...codeMirrorParams} />
          </div>
          <div className="small help-block">
            Learn more about <ExternalLink href="https://developers.keboola.com/integrate/docker-runner/processors/">Processors</ExternalLink>
          </div>
        </div>
      </div>
    );
  },

  handleChange(e) {
    this.props.onChange(e.target.value);
  }
});
