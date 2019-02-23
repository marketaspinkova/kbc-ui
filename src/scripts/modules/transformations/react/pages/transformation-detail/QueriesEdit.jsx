import React, {PropTypes} from 'react';
import CodeMirror from 'react-code-mirror';
import resolveHighlightMode from './resolveHighlightMode';
import {ExternalLink} from '@keboola/indigo-ui';
import normalizeNewlines from './normalizeNewlines';

export default React.createClass({
  propTypes: {
    queries: PropTypes.string.isRequired,
    splitQueries: PropTypes.object.isRequired,
    backend: PropTypes.string.isRequired,
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    highlightQueryNumber: PropTypes.number,
    highlightingQueryDisabled: PropTypes.bool
  },

  highlightQuery() {
    const splitQueries = this.props.splitQueries;
    const query = splitQueries.get(this.props.highlightQueryNumber - 1);
    const positionStart = this.props.queries.indexOf(query);
    if (positionStart === -1) {
      return;
    }
    const lineStart = (this.props.queries.substring(0, positionStart).match(/\n/g) || []).length;
    const positionEnd = positionStart + query.length;
    const lineEnd = (this.props.queries.substring(0, positionEnd).match(/\n/g) || []).length + 1;
    this.refs.CodeMirror.editor.setSelection({line: lineStart, ch: 0}, {line: lineEnd, ch: 0});
    const scrollTop = this.refs.CodeMirror.editor.cursorCoords({line: lineStart, ch: 0}).top - 100;
    const component = this;
    /* global window */
    setTimeout(function() {
      window.scrollTo(0, scrollTop);
      if (component.props.onHighlightingFinished) {
        component.props.onHighlightingFinished();
      }
    });
  },

  componentDidUpdate(previousProps) {
    if (previousProps.highlightQueryNumber !== this.props.highlightQueryNumber
      || previousProps.highlightingQueryDisabled !== this.props.highlightingQueryDisabled && !this.props.highlightingQueryDisabled) {
      this.highlightQuery();
    }
  },

  componentDidMount() {
    if (this.props.highlightQueryNumber) {
      this.highlightQuery();
    }
  },

  render() {
    return (
      <div className="kbc-queries-edit">
        <div>
          <div className="edit form-group kbc-queries-editor">
            <CodeMirror
              ref="CodeMirror"
              value={normalizeNewlines(this.props.queries)}
              theme="solarized"
              lineNumbers={true}
              mode={resolveHighlightMode(this.props.backend, null)}
              lineWrapping={true}
              autofocus={true}
              onChange={this.handleChange}
              readOnly={this.props.disabled ? 'nocursor' : false}
              placeholder="-- Your SQL goes here..."
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
    if (this.props.backend === 'snowflake') {
      return (<span>Learn more about <ExternalLink href="https://help.keboola.com/manipulation/transformations/snowflake/">using Snowflake</ExternalLink>.</span>);
    }
    if (this.props.backend === 'redshift') {
      return (<span>Learn more about <ExternalLink href="https://help.keboola.com/manipulation/transformations/redshift/">using Redshift</ExternalLink>.</span>);
    }
  },

  handleChange(e) {
    this.props.onChange(normalizeNewlines(e.target.value));
  }

});
