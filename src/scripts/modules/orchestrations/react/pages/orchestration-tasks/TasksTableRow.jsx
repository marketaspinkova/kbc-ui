import React from 'react';
import { HelpBlock } from 'react-bootstrap';
import ComponentIcon from '../../../../../react/common/ComponentIcon';
import ComponentName from '../../../../../react/common/ComponentName';
import ComponentConfigurationLink from '../../../../components/react/components/ComponentConfigurationLink';
import TaskParametersEditModal from '../../modals/TaskParametersEdit';
import OrchestrationTaskRunButton from '../../components/OrchestrationTaskRunButton';
import { Check, NotAvailable } from '@keboola/indigo-ui';
import descriptionExcerpt from '../../../../../utils/descriptionExcerpt';

export default React.createClass({
  propTypes: {
    orchestration: React.PropTypes.object.isRequired,
    onRun: React.PropTypes.func.isRequired,
    task: React.PropTypes.object.isRequired,
    component: React.PropTypes.object,
    color: React.PropTypes.string
  },

  render() {
    return (
      <tr style={{ backgroundColor: this.props.color }}>
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
            <NotAvailable/>
          )}
        </td>
        <td>
          <span className="label label-info">{this.props.task.get('action')}</span>
        </td>
        <td>
          <Check isChecked={this.props.task.get('active')} />
        </td>
        <td>
          <Check isChecked={this.props.task.get('continueOnFailure')} />
        </td>
        <td>
          <div className="pull-right">
            <TaskParametersEditModal
              isEditable={false}
              parameters={this.props.task.get('actionParameters').toJS()}
            />
            <OrchestrationTaskRunButton
              orchestration={this.props.orchestration}
              onRun={this.props.onRun}
              task={this.props.task}
              notify={true}
              key="run"
            />
          </div>
        </td>
      </tr>
    );
  }
});
