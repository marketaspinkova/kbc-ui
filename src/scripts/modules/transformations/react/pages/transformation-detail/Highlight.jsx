import PropTypes from 'prop-types';
import React from 'react';
import CodeMirror from 'codemirror';
import _ from 'underscore';
import normalizeNewlines from './normalizeNewlines';

export default React.createClass({
  propTypes: {
    script: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired
  },

  /* taken from codemirror tests and modified */
  stringify(obj) {
    function replacer(key, object) {
      if (typeof object === 'function') {
        var m = object.toString().match(/function\s*[^\s(]*/);
        return m ? m[0] : 'function';
      }
      return object;
    }
    if (JSON && JSON.stringify) {
      return JSON.stringify(obj, replacer, 2);
    }
    return '[unsupported]';  // Fail safely if no native JSON.
  },

  /* taken from codemirror tests and modified */
  highlight(string, mode) {
    var state = mode.startState();

    var lines = normalizeNewlines(string).split('\n');
    var st = [], pos = 0;

    for (var i = 0; i < lines.length; ++i) {
      var line = lines[i].replace(/\t/g, '    '), newLine = true;
      if (mode.indent) {
        var ws = line.match(/^\s*/)[0];
        var indent = mode.indent(state, line.slice(ws.length));
        if (indent !== CodeMirror.Pass && indent !== ws.length) {
          (st.indentFailures || (st.indentFailures = [])).push(
            'Indentation of line ' + (i + 1) + ' is ' + indent + ' (expected ' + ws.length + ')');
        }
      }

      var stream = new CodeMirror.StringStream(line);
      if (line === '' && mode.blankLine) {
        mode.blankLine(state);
      }
      /* Start copied code from CodeMirror.highlight */
      while (!stream.eol()) {
        for (var j = 0; j < 10 && stream.start >= stream.pos; j++) {
          var compare = mode.token(stream, state);
        }
        if (j === 10) {
          throw new Error('Failed to advance the stream.' + stream.string + ' ' + stream.pos);
        }
        var substr = stream.current();
        if (compare && compare.indexOf(' ') > -1) {
          compare = compare.split(' ').sort().join(' ');
        }
        stream.start = stream.pos;
        if (pos && st[pos - 1].style === compare && !newLine) {
          st[pos - 1].text += substr;
        } else if (substr) {
          st[pos++] = {style: compare, text: substr, state: this.stringify(state)};
        }
        // Give up when line is ridiculously long
        if (stream.pos > 20000) {
          st[pos++] = {style: null, text: this.text.slice(stream.pos)};
          break;
        }
        newLine = false;
      }
      st[pos++] = {style: null, text: '\n'};
    }
    return st;
  },

  render() {
    var config = {
      indentUnit: 2
    };
    var highlighted = this.highlight(this.props.script, CodeMirror.getMode(config, this.props.mode));

    return (
      <div className="CodeMirror cm-s-solarized CodeMirror-wrap">
        <div className="CodeMirror-code">
          <pre>
            {this.renderNodes(highlighted)}
          </pre>
        </div>
      </div>

    );
  },

  renderNodes(nodes) {
    var component = this;
    return _.map(nodes, function(node) {
      return (
        <span className={component.getNodeStyle(node.style)}>{node.text}</span>
      );
    });
  },

  getNodeStyle(style) {
    if (!style) {
      return '';
    }
    return 'cm-' + style;
  }

});
