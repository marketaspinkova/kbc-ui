import PropTypes from 'prop-types';
import React from 'react';
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
    return (
      <div className="kbc-processor-edit">
        <div>
          <div className="edit form-group kbc-processor-editor">
            <CodeMirror
              ref='CodeMirror'
              theme='solarized'
              mode='application/json'
              autofocus
              lineNumbers
              lineWrapping
              lint={false}
              value={this.props.value}
              onChange={this.handleChange}
              readOnly={this.props.disabled}
              gutters={['CodeMirror-lint-markers']}
              placeholder={JSON.stringify({before: [], after: []}, null, 2)}
            />
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
