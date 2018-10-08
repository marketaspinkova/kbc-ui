import React from 'react';

const queryEditorPlaceholder = {
  'default': 'e.g. SELECT "id", "name" FROM "myTable"',
  'keboola.ex-db-mysql': 'e.g. SELECT `id`, `name` FROM `myTable`'
};

export function getQueryEditorPlaceholder(componentId) {
  return queryEditorPlaceholder[componentId] ? queryEditorPlaceholder[componentId] : queryEditorPlaceholder.default;
}

const queryEditorHelp = {
  'keboola.ex-db-oracle': 'Please do not put semicolons at the end of the query.',
  'keboola.ex-db-mssql': <div>From Oct 1, 2018, DATETIME fields will be exported with milliseconds.<br/>
    If you'd like to export without milliseconds please cast your column as <code>CONVERT(DATETIME2(0), my_column)</code><br/>
    See the <a href="https://help.keboola.com/extractors/database/sqldb/#ms-sql-server-advanced-mode">documentation</a>
    &nbsp;for further help.</div>
};

export function getQueryEditorHelpText(componentId) {
  return queryEditorHelp[componentId] ? queryEditorHelp[componentId] : null;
}
