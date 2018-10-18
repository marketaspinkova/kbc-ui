import React, { PropTypes } from 'react';
import CodeMirror from 'react-code-mirror';
import resolveHighlightMode from './resolveHighlightMode';
import {ExternalLink} from '@keboola/indigo-ui';

export default React.createClass({
  propTypes: {
    queries: PropTypes.string.isRequired,
    splitQueries: PropTypes.object.isRequired,
    backend: PropTypes.string.isRequired,
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    highlightQueryNumber: PropTypes.number
  },

  getInitialState() {
    return {
      highlightedLine: null
    };
  },

  componentDidMount() {
    if (this.props.highlightQueryNumber) {
      this.highlightQuery();
    }
  },

  componentDidUpdate(previousProps) {
    if (this.props.highlightQueryNumber && previousProps.highlightQueryNumber !== this.props.highlightQueryNumber) {
      this.highlightQuery();
    } else if (!this.props.highlightQueryNumber && this.state.highlightedLine) {
      this.checkPreviouslyHighlightedLine();
    }
  },

  render() {
    return (
      <div className="kbc-queries-edit">
        <div>
          <div className="edit form-group kbc-queries-editor">
            <CodeMirror
              ref="CodeMirror"
              value={this.props.queries}
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
          <div className="small help-block">{this.help()}</div>
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
    if (this.props.backend === 'mysql') {
      return (<span>Learn more about <ExternalLink href="https://help.keboola.com/manipulation/transformations/mysql/">using MySQL</ExternalLink>.</span>);
    }
  },

  handleChange(e) {
    this.props.onChange(e.target.value);
  },

  highlightQuery() {
    this.checkPreviouslyHighlightedLine();

    this.refs.CodeMirror.editor.addLineClass(this.props.highlightQueryNumber - 1, 'background', 'bg-danger');

    this.setState({
      highlightedLine: this.props.highlightQueryNumber
    });
  },

  checkPreviouslyHighlightedLine() {
    if (this.state.highlightedLine) {
      this.refs.CodeMirror.editor.removeLineClass(this.state.highlightedLine - 1, 'background', 'bg-danger');
    }
  }
});
