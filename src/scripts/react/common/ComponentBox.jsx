import PropTypes from 'prop-types';
import React from 'react';

import createReactClass from 'create-react-class';

import ComponentDetailLink from './ComponentDetailLink';
import ComponentBadgeCell from './ComponentBadgeCell';
import ComponentIcon from './ComponentIcon';
import ComponentName from './ComponentName';
import { getComponentBadgesIncluding } from './componentHelpers';

export default createReactClass({
  propTypes: {
    component: PropTypes.object.isRequired
  },

  render() {
    const component = this.props.component;
    return (
      <ComponentDetailLink
        componentId={component.get('id')}
        type={component.get('type')}
      >
        <ComponentBadgeCell
          badges={getComponentBadgesIncluding(component, ['3rdParty', 'appInfo.beta', 'complexity'])}
        />
        <ComponentIcon component={component} size="64" />
        <h2>
          <ComponentName component={component}/>
        </h2>
        <p className="kbc-components-overview-description">
          {component.get('description')}
        </p>
      </ComponentDetailLink>
    );
  }
});
