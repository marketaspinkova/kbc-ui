import PropTypes from 'prop-types';
import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import ConfigurationRow from './ConfigurationRow';
import ComponentIcon from '../../../../react/common/ComponentIcon';
import ComponentName from '../../../../react/common/ComponentName';
import ComponentDetailLink from '../../../../react/common/ComponentDetailLink';
import ComponentBadgeRow from '../../../../react/common/ComponentBadgeRow';
import { getComponentBadgesExcluding } from '../../../../react/common/componentHelpers';

export default React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    component: PropTypes.object.isRequired,
    deletingConfigurations: PropTypes.object.isRequired
  },

  render() {
    return (
      <div>
        <div className="kbc-header">
          <div className="kbc-title">
            <h2>
              <ComponentIcon component={this.props.component} size="32" />
              <ComponentDetailLink type={this.props.component.get('type')} componentId={this.props.component.get('id')}>
                <ComponentName component={this.props.component} />
              </ComponentDetailLink>
            </h2>
          </div>
          <ComponentBadgeRow badges={getComponentBadgesExcluding(this.props.component, ['documentation'])} />
        </div>
        <div className="table table-hover">
          <span className="tbody">{this.configurations()}</span>
        </div>
      </div>
    );
  },

  configurations() {
    return this.props.component
      .get('configurations')
      .map(configuration => {
        return (
          <ConfigurationRow
            component={this.props.component}
            config={configuration}
            componentId={this.props.component.get('id')}
            isDeleting={this.props.deletingConfigurations.has(configuration.get('id'))}
            key={configuration.get('id')}
          />
        );
      })
      .toArray();
  }
});
