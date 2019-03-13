import PropTypes from 'prop-types';
import React from 'react';
import { fromJS } from 'immutable';
import { HelpBlock } from 'react-bootstrap';
import ComponentConfigurationLink from '../../../../components/react/components/ComponentConfigurationLink';
import TaskParametersEditModal from '../../modals/TaskParametersEdit';
import ComponentIcon from '../../../../../react/common/ComponentIcon';
import ComponentName from '../../../../../react/common/ComponentName';
import Tooltip from '../../../../../react/common/Tooltip';
import descriptionExcerpt from '../../../../../utils/descriptionExcerpt';

export default React.createClass({
  propTypes: {
    task: PropTypes.object.isRequired,
    component: PropTypes.object,
    disabled: PropTypes.bool.isRequired,
    onTaskDelete: PropTypes.func.isRequired,
    onTaskUpdate: PropTypes.func.isRequired,
    toggleMarkTask: PropTypes.func.isRequired,
    isMarked: PropTypes.bool.isRequired,
    color: PropTypes.string
  },

  render() {
    return (
      <tr style={{ backgroundColor: this.props.color }}>
        <td>
          <Tooltip tooltip="Select task to move between phases">
            <input
              type="checkbox"
              checked={this.props.isMarked}
              onClick={() => {
                return this.props.toggleMarkTask(this.props.task.get('id'));
              }}
            />
          </Tooltip>
        </td>
        <td>
          <span className="kbc-component-icon">
            {this.props.component ? <ComponentIcon component={this.props.component} /> : ' '}
          </span>
          {this.props.component ? (
            <ComponentName component={this.props.component} showType />
          ) : (
            this.props.task.get('componentUrl')
          )}
        </td>
        <td>
          {this.props.task.has('config') ? (
            <ComponentConfigurationLink
              componentId={this.props.task.get('component')}
              configId={this.props.task.getIn(['config', 'id'])}
            >
              {this.props.task.getIn(['config', 'name'])}
              <HelpBlock>
                <small className="kbc-break-all">
                  {descriptionExcerpt(this.props.task.getIn(['config', 'description']))}
                </small>
              </HelpBlock>
            </ComponentConfigurationLink>
          ) : (
            'N/A'
          )}
        </td>
        <td>
          <div className="form-group form-group-sm">
            <input
              className="form-control"
              type="text"
              defaultValue={this.props.task.get('action')}
              disabled={this.props.disabled}
              onChange={this._handleActionChange}
            />
          </div>
        </td>
        <td>
          <input
            type="checkbox"
            disabled={this.props.disabled}
            checked={this.props.task.get('active')}
            onChange={this._handleActiveChange}
          />
        </td>
        <td>
          <input
            type="checkbox"
            disabled={this.props.disabled}
            checked={this.props.task.get('continueOnFailure')}
            onChange={this._handleContinueOnFailureChange}
          />
        </td>
        {this._renderActionButtons()}
      </tr>
    );
  },

  _renderActionButtons() {
    return (
      <td className="text-right kbc-no-wrap">
        <div className="">
          <TaskParametersEditModal
            onSet={this._handleParametersChange}
            parameters={this.props.task.get('actionParameters').toJS()}
          />
          <button style={{ padding: '2px' }} onClick={this._handleDelete} className="btn btn-link">
            <Tooltip placement="top" tooltip="Remove task">
              <span className="kbc-icon-cup" />
            </Tooltip>
          </button>
        </div>
      </td>
    );
  },

  _handleParametersChange(parameters) {
    return this.props.onTaskUpdate(this.props.task.set('actionParameters', fromJS(parameters)));
  },

  _handleActionChange(event) {
    return this.props.onTaskUpdate(this.props.task.set('action', event.target.value.trim()));
  },

  _handleActiveChange() {
    return this.props.onTaskUpdate(this.props.task.set('active', !this.props.task.get('active')));
  },

  _handleContinueOnFailureChange() {
    return this.props.onTaskUpdate(this.props.task.set('continueOnFailure', !this.props.task.get('continueOnFailure')));
  },

  _handleDelete() {
    return this.props.onTaskDelete(this.props.task.get('id'));
  }
});
