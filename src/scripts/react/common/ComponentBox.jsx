import React from 'react';

import ComponentDetailLink from './ComponentDetailLink';
import ComponentBadgeCell from './ComponentBadgeCell';
import ComponentIcon from './ComponentIcon';
import ComponentName from './ComponentName';
import { getComponentBadgesIncluding } from './componentHelpers';

export default React.createClass({
  propTypes: {
    component: React.PropTypes.object.isRequired
  },

  render() {
    const component = this.props.component;
    return (
      <ComponentDetailLink
        componentId={component.get('id')}
        type={component.get('type')}
        className="components-overview-item"
      >
        <ComponentBadgeCell
          badges={getComponentBadgesIncluding(component, ['3rdParty', 'appInfo.beta', 'complexity'])}
        />
        <ComponentIcon className="components-overview-icon" component={component} size="64" />
        <h2 className="components-overview-title">
          <ComponentName component={component}/>
        </h2>
        <p className="components-overview-description">
          {component.get('description')}
        </p>
      </ComponentDetailLink>
    );
  }
});
