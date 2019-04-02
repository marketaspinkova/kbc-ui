import removeMarkdown from 'remove-markdown';
import underscoreString from 'underscore.string';

const TRUNCATE_LENGTH = 1000;
const PRUNE_LENGTH = 75;

// We keep first 1000 characters
// Double spaces are removed (prevents freeze https://github.com/stiang/remove-markdown/issues/35)
// Markdown is removed
// String is nicely truncated (keeps words) to 75
export default function(description) {
  if (!description) {
    return '';
  }
  return underscoreString.prune(
    removeMarkdown(underscoreString.clean(underscoreString.truncate(description, TRUNCATE_LENGTH, ''))),
    PRUNE_LENGTH
  );
}
