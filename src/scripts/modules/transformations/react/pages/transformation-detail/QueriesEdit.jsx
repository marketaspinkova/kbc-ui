import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import { Controlled as CodeMirror } from 'react-codemirror2';
import { Map, List } from 'immutable';
import { ExternalLink } from '@keboola/indigo-ui';
import { HelpBlock } from 'react-bootstrap';
import resolveHighlightMode from './resolveHighlightMode';
import normalizeNewlines from './normalizeNewlines';

export default createReactClass({
  propTypes: {
    transformation: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired,
    queries: PropTypes.string.isRequired,
    splitQueries: PropTypes.object.isRequired,
    backend: PropTypes.string.isRequired,
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    highlightQueryNumber: PropTypes.number,
    highlightingQueryDisabled: PropTypes.bool
  },

  editor: null,

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
    this.editor.setSelection({ line: lineStart, ch: 0 }, { line: lineEnd, ch: 0 });
    const scrollTop = this.editor.cursorCoords({ line: lineStart, ch: 0 }).top - 100;

    /* global window */
    setTimeout(() => {
      window.scrollTo(0, scrollTop);
      if (this.props.onHighlightingFinished) {
        this.props.onHighlightingFinished();
      }
    });
  },

  componentDidUpdate(previousProps) {
    if (
      previousProps.highlightQueryNumber !== this.props.highlightQueryNumber ||
      (previousProps.highlightingQueryDisabled !== this.props.highlightingQueryDisabled &&
        !this.props.highlightingQueryDisabled)
    ) {
      this.highlightQuery();
    }

    if (
      !previousProps.transformation.get('input').equals(this.props.transformation.get('input')) ||
      !previousProps.transformation.get('output').equals(this.props.transformation.get('output'))
    ) {
      this.updateCodeMirrorHintTables();
    }
  },

  componentDidMount() {
    this.updateCodeMirrorHintTables();

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
              editorDidMount={(editor) => {
                this.editor = editor;
                editor.refresh();
              }}
              value={normalizeNewlines(this.props.queries)}
              onBeforeChange={this.handleChange}
              options={{
                theme: 'solarized',
                mode: resolveHighlightMode(this.props.backend, null),
                lineNumbers: true,
                lineWrapping: true,
                readOnly: this.props.disabled,
                placeholder: '-- Your SQL goes here...',
                extraKeys: { 'Ctrl-Space': 'autocomplete' }
              }}
            />
          </div>
          {this.help()}
        </div>
      </div>
    );
  },

  help() {
    if (this.props.backend === 'snowflake') {
      return (
        <HelpBlock>
          Learn more about <ExternalLink href="https://help.keboola.com/manipulation/transformations/snowflake/">using Snowflake</ExternalLink>.{' '}
          Use <code>Ctrl+Space</code> for autocomplete and syntax hints.
        </HelpBlock>
      );
    }

    if (this.props.backend === 'redshift') {
      return (
        <HelpBlock>
          Learn more about{' '}
          <ExternalLink href="https://help.keboola.com/manipulation/transformations/redshift/">
            using Redshift
          </ExternalLink>
          .
        </HelpBlock>
      );
    }

    return null;
  },

  handleChange(editor, data, value) {
    this.props.onChange(normalizeNewlines(value));
  },

  updateCodeMirrorHintTables() {
    this.editor.setOption('hintOptions', {
      tables: this.getTables()
    });
  },

  getTables() {
    let tables = Map();

    this.props.transformation.get('input', List()).forEach(input => {
      tables = tables.set(`"${input.get('destination')}"`, this.getColumns(input));
    });

    this.props.transformation.get('output', List()).forEach((output) => {
      tables = tables.set(`"${output.get('source')}"`, List());
    });

    return tables.toJS();
  },

  getColumns(input) {
    let columns = input.get('columns', List());

    if (!columns.count()) {
      columns = this.props.tables.getIn([input.get('source'), 'columns'], List());
    }

    return columns.map(column => `"${column}"`);
  }
});
