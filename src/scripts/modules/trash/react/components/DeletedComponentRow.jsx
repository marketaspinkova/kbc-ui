import PropTypes from 'prop-types';
import React from 'react';
import DeletedConfigurationRow from './DeletedConfigurationRow';
import ComponentIcon from '../../../../react/common/ComponentIcon';
import ComponentName from '../../../../react/common/ComponentName';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export default React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    component: PropTypes.object.isRequired,
    configurations: PropTypes.object.isRequired,
    deletingConfigurations: PropTypes.object.isRequired,
    restoringConfigurations: PropTypes.object.isRequired
  },

  render() {
    return (
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
          <DeletedConfigurationRow
            component={this.props.component}
            config={configuration}
            componentId={this.props.component.get('id')}
            isDeleting={this.props.deletingConfigurations.has(configuration.get('id'))}
            isRestoring={this.props.restoringConfigurations.has(configuration.get('id'))}
            key={configuration.get('id')}
          />
        );
      })
      .toArray();
  }
});
