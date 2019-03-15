import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import CodeMirror from 'react-code-mirror';

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
              theme='solarized'
              mode='application/json'
              placeholder='Your JSON config goes here...'
              lineNumbers
              lint
              autofocus
              lineWrapping
              value={this.props.value}
              onChange={this.handleChange}
              readOnly={this.props.disabled}
              gutters={['CodeMirror-lint-markers']}
            />
          </div>
          <div className="small help-block">
            {this.help()}
          </div>
        </div>
      </div>
    );
  },

  help() {
    return null;
  },

  handleChange(e) {
    this.props.onChange(e.target.value);
  }
});
