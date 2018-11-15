export default function(inputString, query) {
  const queryWords = query.trim().split(' ');
  return queryWords.reduce((memo, word) => {
    return memo && inputString.indexOf(word) >= 0;
  }, true);
}
