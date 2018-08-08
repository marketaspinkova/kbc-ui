import React from 'react';

import ComponentDetailLink from './ComponentDetailLink';
import ComponentBadgeCell from './ComponentBadgeCell';
import ComponentIcon from './ComponentIcon';
import ComponentName from './ComponentName';
import { getComponentBadges } from './componentHelpers';

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
      >
        <ComponentBadgeCell
          badges={getComponentBadges(component)}
          badgesFilter={['3rdParty', 'appInfo.beta', 'complexity']}
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
