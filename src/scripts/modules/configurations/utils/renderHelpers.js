import React from 'react';
import createReactClass from 'create-react-class';
import createCollapsibleSection from './createCollapsibleSection';

export function CollapsibleSection(definition) {
  const { title, contentComponent, options } = definition;
  const titleComponent = typeof title === 'string' ? () => <span>{title}</span> : title;
  return createCollapsibleSection(titleComponent, contentComponent, options);
}
