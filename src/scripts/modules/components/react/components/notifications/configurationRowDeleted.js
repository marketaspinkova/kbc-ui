import React from 'react';
import createReactClass from 'create-react-class';
import {Link} from 'react-router';
import ComponentStore from '../../../stores/ComponentsStore';

export default (row, changeDescription, componentId, configurationId) => {
  const message = changeDescription ? changeDescription : ('Row ' + (row.get('name') !== '' ? row.get('name') : 'Untitled' ) + ' was deleted.');
  const component = ComponentStore.getComponent(componentId);
  const versionsLinkTo = component.get('type') + '-versions';
  const versionsLinkParams = {
    component: componentId,
    config: configurationId
  };
  return createReactClass({
    render: function() {
      return (
        <span>
          {message}
          {' '}
          <Link to={versionsLinkTo} params={versionsLinkParams}>
            Show versions
          </Link>.
        </span>
      );
    }
  });
};
