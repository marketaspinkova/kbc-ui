import CodeMirror from 'codemirror';
import jsonlint from './parser';
import 'codemirror/addon/lint/lint';

CodeMirror.registerHelper('lint', 'json', text => {
  const found = [];

  jsonlint.parser.parseError = (str, hash) => {
    found.push({
      from: CodeMirror.Pos(hash.loc.first_line - 1, hash.loc.first_column),
      to: CodeMirror.Pos(hash.loc.last_line - 1, hash.loc.last_column),
      message: str
    });
  };

  try {
    jsonlint.parse(text);
  } catch (e) {
    // it is handled with code above
  }

  return found;
});
