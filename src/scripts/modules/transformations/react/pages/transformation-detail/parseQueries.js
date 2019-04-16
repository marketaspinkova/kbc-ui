import { List } from 'immutable';

/**
 * Taken and modified from
 * http://stackoverflow.com/questions/4747808/split-mysql-queries-in-array-each-queries-separated-by/5610067#5610067
 * @param {string} queries SQL Queries
 * @return {Object} List of queries
 */
export default function(queries) {
  const regex = /\s*((?:'[^'\\\\]*(?:\\\\.[^'\\\\]*)*'|"[^"\\\\]*(?:\\\\.[^"\\\\]*)*"|#.*|\\\/\\*[\\w\\W]*?(?=\\*\\\/)\\*\\\/|--.*|[^"';#])+(?:;|$))/g;

  return List(queries.match(regex));
}
