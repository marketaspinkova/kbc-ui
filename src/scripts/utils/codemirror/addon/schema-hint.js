import CodeMirror from 'codemirror';
import { isSchema } from 'yup';
import { startsWith } from 'underscore.string';

CodeMirror.registerHelper('hint', 'json', function(cm) {
  const mode = cm.options.mode;
  const schema = cm.options.hintOptions.schema;
  const cur = cm.getCursor();
  const token = cm.getTokenAt(cur);

  if (mode !== 'application/json' || !isSchema(schema) || !startsWith(token.string, '"')) {
    return;
  }

  const lines = []
    .concat(...cm.getDoc().children.map((leaf) => leaf.lines))
    .slice(0, cur.line + 1)
    .reverse();
  const current = lines.shift().text;

  if (current.trim() !== '"') {
    return;
  }

  let parents = [];
  let indent = 2;
  lines.forEach(({ text }) => {
    if (text.indexOf('": {') !== -1 && startsWith(text, current.slice(indent))) {
      parents.push(text.split('"')[1]);
      indent += 2;
    } else if (text.indexOf('": [') !== -1 && startsWith(text, current.slice(indent + 2))) {
      parents.push(text.split('"')[1]);
      indent += 4;
    }
  });
  parents = parents.reverse();

  let result = [];
  const extractFields = (schema, deep = 0) => {
    const fields = schema._type === 'object' ? schema.fields : schema._subType.fields;
    if (fields) {
      if (parents.length === deep) {
        result.push(...Object.keys(fields).map((field) => `"${field}"`));
      } else {
        Object.entries(fields).forEach(([name, innerSchema]) => {
          if (name === parents[deep]) {
            extractFields(innerSchema, deep + 1);
          }
        });
      }
    }
  };
  extractFields(schema);

  if (result.length > 0)
    return {
      list: result.filter((result) => startsWith(result, token.string)),
      from: CodeMirror.Pos(cur.line, token.start),
      to: CodeMirror.Pos(cur.line, cur.ch)
    };
});
