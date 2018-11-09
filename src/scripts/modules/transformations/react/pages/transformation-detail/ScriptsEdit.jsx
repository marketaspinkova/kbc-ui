import React, {PropTypes} from 'react';
import CodeMirror from 'react-code-mirror';
import resolveHighlightMode from './resolveHighlightMode';
import {ExternalLink} from '@keboola/indigo-ui';

export default React.createClass({
  propTypes: {
    script: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
    backend: PropTypes.string.isRequired
  },

  render() {
    var codeMirrorParams = {
      value: this.props.script,
      theme: 'solarized',
      lineNumbers: true,
      mode: resolveHighlightMode('docker', this.props.backend),
      autofocus: true,
      lineWrapping: true,
      onChange: this.handleChange,
      readOnly: this.props.disabled
    };
    if (this.props.backend === 'openrefine') {
      codeMirrorParams.lint = true;
      codeMirrorParams.gutters = ['CodeMirror-lint-markers'];
      codeMirrorParams.placeholder = '# Your OpenRefine JSON config goes here...';
    }
    if (this.props.backend === 'python') {
      codeMirrorParams.placeholder = '# Your Python script goes here...';
    }
    if (this.props.backend === 'r') {
      codeMirrorParams.placeholder = '# Your R script goes here...';
    }
    return (
      <div className="kbc-queries-edit">
        <div>
          <div className="edit form-group kbc-queries-editor">
            <CodeMirror {...codeMirrorParams} />
          </div>
          <div className="small help-block">
            {this.help()}
          </div>
        </div>
      </div>
    );
  },

  help() {
    if (this.props.backend === 'python') {
      return (<span>Learn more about <ExternalLink href="https://help.keboola.com/manipulation/transformations/python/">using Python</ExternalLink>.</span>);
    }
    if (this.props.backend === 'r') {
      return (<span>Learn more about <ExternalLink href="https://help.keboola.com/manipulation/transformations/r/">using R</ExternalLink>.</span>);
    }
    if (this.props.backend === 'openrefine') {
      return (<span>Learn more about <ExternalLink href="https://help.keboola.com/manipulation/transformations/openrefine/">using OpenRefine</ExternalLink>.</span>);
    }
  },

  handleChange(e) {
    this.props.onChange(e.target.value);
  }
});
