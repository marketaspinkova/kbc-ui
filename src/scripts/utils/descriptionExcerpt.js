import removeMarkdown from 'remove-markdown';
import React from 'react';

// remove markdown markup and trim to 100 characters
export default function(description) {
  if (description === null || !description) {
    return '';
  }
  var plainText = removeMarkdown(description);
  if (plainText.length > 75) {
    plainText = plainText.substring(0, 75) + '...';
  }
  return (<div className="description description-small">{plainText}</div>);
}
