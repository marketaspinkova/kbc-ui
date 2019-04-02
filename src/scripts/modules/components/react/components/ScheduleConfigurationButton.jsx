import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { FormGroup, FormControl, ControlLabel, HelpBlock } from 'react-bootstrap';
import Select from 'react-select';
import ApplicationActionCreators from '../../../../actions/ApplicationActionCreators';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import CronScheduler from '../../../../react/common/CronScheduler';
import Confirm from '../../../../react/common/Confirm';
import OrchestrationActionCreators from '../../../orchestrations/ActionCreators';
import InstalledComponentsStore from '../../stores/InstalledComponentsStore';
import configurationScheduled from './notifications/configurationScheduled';

const CUSTOM_SCHEDULE_PLAN = 'custom';
const scheduleOptions = [
  { label: 'Custom schedule', value: CUSTOM_SCHEDULE_PLAN },
  { label: 'Every minute', value: '*/5 * * * *' },
  { label: 'Every 10 minutes', value: '*/10 * * * *' },
  { label: 'Twice per hour', value: '*/30 * * * *' },
  { label: 'Once per hour', value: '1 * * * *' },
  { label: 'Once per 6 hours', value: '0 */6 * * *' },
  { label: 'Twice a day (5 am, 5 pm)', value: '0 5,17 * * *' },
  { label: 'Once a day (12 pm)', value: '0 12 * * *' }
];

export default createReactClass({
  mixins: [createStoreMixin(InstalledComponentsStore)],

  propTypes: {
    componentId: PropTypes.string.isRequired,
    configId: PropTypes.string.isRequired
  },

  getStateFromStores() {
    return {
      config: InstalledComponentsStore.getConfig(this.props.componentId, this.props.configId)
    };
  },

  getInitialState() {
    return {
      name: '',
      customCrontabRecord: '0 0 * * *',
      predefinedCrontabRecord: '1 * * * *',
      isLoading: false
    };
  },

  render() {
    if (!this.state.config.count()) {
      return null;
    }

    return (
      <Confirm
        closeAfterResolve
        title={`Automate ${this.state.config.get('name')}`}
        onConfirm={this.handleSubmit}
        isLoading={this.state.isLoading}
        text={this.renderBody()}
        buttonType="primary"
        buttonLabel="Automate"
        childrenRootElement="a"
      >
        <i className="fa fa-clock-o fa-fw" /> Automate
      </Confirm>
    );
  },

  renderBody() {
    return (
      <div className="form">
        <p>You are about to create a single task orchestration with given name and schedule.</p>
        <br />
        <FormGroup>
          <ControlLabel>Orchestration name</ControlLabel>
          <FormControl
            type="text"
            placeholder={`Automated ${this.state.config.get('name')}`}
            onChange={this.handleName}
            value={this.state.name}
          />
          <HelpBlock>Leave blank to use the default name</HelpBlock>
        </FormGroup>
        <FormGroup>
          <ControlLabel>Schedule</ControlLabel>
          <Select
            autoFocus
            onChange={this.handlePredefinedCrobtabRecord}
            value={this.state.predefinedCrontabRecord}
            options={scheduleOptions}
            deleteRemoves={false}
            clearable={false}
            backspaceRemoves={false}
          />
        </FormGroup>
        {this.state.predefinedCrontabRecord === CUSTOM_SCHEDULE_PLAN && (
          <CronScheduler
            crontabRecord={this.state.customCrontabRecord}
            onChange={this.handleCustomCrobtabRecord}
          />
        )}
      </div>
    );
  },

  handleName(event) {
    this.setState({ name: event.target.value });
  },

  handlePredefinedCrobtabRecord(selected) {
    this.setState({ predefinedCrontabRecord: selected.value });
  },

  handleCustomCrobtabRecord(crontabRecord) {
    this.setState({ customCrontabRecord: crontabRecord });
  },

  handleSubmit() {
    const redirectToCreatedOrchestration = false;
    this.setState({ isLoading: true });
    return OrchestrationActionCreators.createOrchestration(
      {
        name: this.state.name || `Automated ${this.state.config.get('name')}`,
        crontabRecord:
          this.state.predefinedCrontabRecord === CUSTOM_SCHEDULE_PLAN
            ? this.state.customCrontabRecord
            : this.state.predefinedCrontabRecord,
        tasks: [
          {
            component: this.props.componentId,
            action: 'run',
            actionParameters: {
              config: this.props.configId.toString()
            },
            continueOnFailure: false,
            active: true
          }
        ]
      },
      redirectToCreatedOrchestration
    )
      .then((orchestration) => {
        ApplicationActionCreators.sendNotification({
          message: configurationScheduled(this.state.config, orchestration.id)
        });
      })
      .finally(() => {
        this.setState({ isLoading: false });
      });
  }
});
