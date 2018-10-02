
const queryEditorPlaceholder = {
  'default': 'e.g. SELECT "id", "name" FROM "myTable"',
  'keboola.ex-db-mysql': 'e.g. SELECT `id`, `name` FROM `myTable`'
};

export function getQueryEditorPlaceholder(componentId) {
  return queryEditorPlaceholder[componentId] ? queryEditorPlaceholder[componentId] : queryEditorPlaceholder.default;
}

const queryEditorHelp = {
  'keboola.ex-db-oracle': 'Please do not put semicolons at the end of the query.',
  'keboola.ex-db-mssql': 'Please note that as of Oct 1, 2018, DATETIME fields will be exported with milliseconds.' +
  '  If you\'d like to export without milliseconds please cast your column as "CONVERT(DATETIME2(0), my_column)"' +
  'Also if you are exporting strings that may contain quotes they should be escaped ' +
  '"char(34) + REPLACE([my_varchar_column], char(34), char(34) + char(34)) + char(34)"'
};

export function getQueryEditorHelpText(componentId) {
  return queryEditorHelp[componentId] ? queryEditorHelp[componentId] : null;
}
