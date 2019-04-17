import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import _ from 'underscore';
import { Tree } from '@keboola/indigo-ui';
import { OverlayTrigger, Popover, Button } from 'react-bootstrap';
import InstalledComponentsStore from '../../../components/stores/InstalledComponentsStore';
import ComponentIcon from '../../../../react/common/ComponentIcon';
import ComponentName from '../../../../react/common/ComponentName';

export default createReactClass({
  propTypes: {
    task: PropTypes.object.isRequired,
    component: PropTypes.object,
    onTaskUpdate: PropTypes.func.isRequired
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
        <td>
          <input type="checkbox" checked={this.props.task.get('active')} readOnly />
        </td>
      </tr>
    );
  },

  _renderConfiguration() {
    const parameters = this.props.task.get('actionParameters');

    if (parameters.size === 1 && parameters.has('config') && this.props.component) {
      const config = InstalledComponentsStore.getConfig(this.props.component.get('id'), parameters.get('config').toString());
      return config.get('name', parameters.get('config'));
    }

    const popover = (
      <Popover id={_.uniqueId('parameters_')} title="Parameters" style={{ maxWidth: '600px' }}>
        <Tree data={this.props.task.get('actionParameters')} />
      </Popover>
    );

    return (
      <OverlayTrigger trigger={['focus', 'hover']} placement="bottom" overlay={popover}>
        <Button onClick={(event) => {event.stopPropagation()}} className="btn btn-link btn-link-inline">
          Show parameters
        </Button>
      </OverlayTrigger>
    );
  },

  _handleActiveChange() {
    return this.props.onTaskUpdate(this.props.task.set('active', !this.props.task.get('active')));
  }
});
