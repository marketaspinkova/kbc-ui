import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import MigrationConfigurationRow from './MigrationConfigurationRow';
import ComponentIcon from '../../../../react/common/ComponentIcon';
import ComponentName from '../../../../react/common/ComponentName';
import ImmutableRenderMixin from 'react-immutable-render-mixin';

export default createReactClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    component: PropTypes.object.isRequired,
    configurations: PropTypes.object.isRequired
  },

  render() {
    return !!this.props.configurations.count() && (
      <div>
        <div className="kbc-header">
          <div className="kbc-title">
            <h2>
              <ComponentIcon component={this.props.component} size="32" />
              <ComponentName component={this.props.component} showType />
            </h2>
          </div>
        </div>
        <div className="table table-hover">
          <span className="tbody">{this.configurations()}</span>
        </div>
      </div>
    );
  },

  configurations() {
    return this.props.configurations
      .map(configuration => {
        return (
          <MigrationConfigurationRow
            component={this.props.component}
            config={configuration}
            componentId={this.props.component.get('id')}
            key={configuration.get('id')}
            isMigrating={false}
          />
        );
      })
      .toArray();
  }
});
