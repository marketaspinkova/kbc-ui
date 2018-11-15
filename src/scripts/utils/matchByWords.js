export default function(inputString, query) {
  const queryWords = query.trim().split(' ');
  const result = queryWords.reduce(
    (memo, word) => {
      const fromIndex = memo.lastMatch && inputString.indexOf(word, memo.fromIndex);
      const lastMatch = memo.lastMatch && fromIndex >= 0;
      return { lastMatch, fromIndex };
    },
    { fromIndex: 0, lastMatch: true }
  );
  return result.lastMatch;
}
