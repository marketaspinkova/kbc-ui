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

  let start = token.start;
  let end = cur.ch;
  let result = [];

  const extractFields = (schema) => {
    if (schema.fields) {
      result.push(...Object.keys(schema.fields).map((field) => `"${field}"`));
      Object.values(schema.fields).forEach(extractFields);
    }
  };
  extractFields(schema);

  if (result.length)
    return {
      list: result.filter((result) => startsWith(result, token.string)),
      from: CodeMirror.Pos(cur.line, start),
      to: CodeMirror.Pos(cur.line, end)
    };
});
