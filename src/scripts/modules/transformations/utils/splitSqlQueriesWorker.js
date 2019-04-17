/**
 * Taken and modified from
 * http://stackoverflow.com/questions/4747808/split-mysql-queries-in-array-each-queries-separated-by/5610067#5610067
 */
const regex = /\s*((?:'[^'\\]*(?:\\.[^'\\]*)*'|"[^"\\]*(?:\\.[^"\\]*)*"|\/\*[^*]*\*+(?:[^*/][^*]*\*+)*\/|#.*|--.*|[^"';#])+(?:;|$))/g;

self.addEventListener('message', function(e) {
  const data = e.data;
  if (data.queries === '') {
    postMessage([]);
    return;
  }
  const matches = data.queries.match(regex);
  if (matches === null) {
    postMessage(null);
    return;
  }
  const response = matches
    .filter((line) => line.trim() !== '')
    .map((line) => line.trim());
  postMessage(response);
}, false);
