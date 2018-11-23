import React from 'react';

import InstalledComponentsStore from '../../../components/stores/InstalledComponentsStore';
import ComponentIcon from '../../../../react/common/ComponentIcon';
import ComponentName from '../../../../react/common/ComponentName';
import { Tree } from '@keboola/indigo-ui';

export default React.createClass({
  propTypes: {
    task: React.PropTypes.object.isRequired,
    component: React.PropTypes.object,
    onTaskUpdate: React.PropTypes.func.isRequired
  },

  render() {
    return (
      <tr onClick={this._handleActiveChange} className="kbc-cursor-pointer">
        <td>
          <span className="kbc-component-icon">
            {this.props.component && <ComponentIcon component={this.props.component} />}{' '}
            {this.props.component ? (
              <ComponentName component={this.props.component} />
            ) : (
              this.props.task.get('componentUrl')
            )}
          </span>
        </td>
        <td>
          <span className="label label-info">{this.props.task.get('action')}</span>
        </td>
        <td className="kbc-break-all kbc-break-word">
          {this._renderConfiguration()}
        </td>
        <td className="text-center">
          <input type="checkbox" checked={this.props.task.get('active')} />
        </td>
      </tr>
    );
  },

  _renderConfiguration() {
    const parameters = this.props.task.get('actionParameters');

    if (parameters.size === 1 && parameters.has('config') && this.props.component) {
      const config = InstalledComponentsStore.getConfig(this.props.component.get('id'), parameters.get('config'));
      return config.get('name', parameters.get('config'));
    }

    return <Tree data={this.props.task.get('actionParameters')} />;
  },

  _handleActiveChange() {
    return this.props.onTaskUpdate(this.props.task.set('active', !this.props.task.get('active')));
  }
});
