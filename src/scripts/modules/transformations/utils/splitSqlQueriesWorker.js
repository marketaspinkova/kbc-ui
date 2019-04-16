/**
 * Taken and modified from
 * http://stackoverflow.com/questions/4747808/split-mysql-queries-in-array-each-queries-separated-by/5610067#5610067
 */
const regex = /\s*((?:'[^'\\]*(?:\\.[^'\\]*)*'|"[^"\\]*(?:\\.[^"\\]*)*"|\/\*[^*]*\*+(?:[^*/][^*]*\*+)*\/|#.*|--.*|[^"';#])+(?:;|$))/g;

self.addEventListener('message', function(e) {
  if (e.data.queries === '') {
    postMessage([]);
    return;
  }
  const matches = e.data.queries.match(regex);
  postMessage(matches);
}, false);
