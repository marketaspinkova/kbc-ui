import React from 'react';
import createCollapsibleSection from './createCollapsibleSection';

export function CollapsibleSection(definition) {
  const { title, contentComponent, options } = definition;
  const titleComponent = typeof title === 'string' ? () => <span>{title}</span> : title;
  return createCollapsibleSection(titleComponent, contentComponent, options);
}
