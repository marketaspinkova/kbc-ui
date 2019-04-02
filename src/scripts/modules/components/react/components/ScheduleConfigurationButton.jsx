import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
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
  { label: 'Every minute', value: '*/5 * * * *' },
  { label: 'Every 10 minutes', value: '*/10 * * * *' },
  { label: 'Twice per hour', value: '*/30 * * * *' },
  { label: 'Once per hour', value: '1 * * * *' },
  { label: 'Once per 5 hours', value: '0 */5 * * *' },
  { label: 'Twice a day', value: '0 5,17 * * *' },
  { label: 'Once per day', value: '0 12 * * *' },
  { label: 'Custom schedule plan', value: CUSTOM_SCHEDULE_PLAN }
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
        title={`Automate ${this.state.config.get('name')} config`}
        onConfirm={this.handleSubmit}
        isLoading={this.state.isLoading}
        text={this.renderBody()}
        buttonType="primary"
        buttonLabel="Automate"
        childrenRootElement="a"
      >
        <i className="fa fa-clock-o fa-fw" /> Automate this config
      </Confirm>
    );
  },

  renderBody() {
    return (
      <div className="form">
        <FormGroup>
          <ControlLabel>Orchestration name (leave blank to use default name)</ControlLabel>
          <FormControl
            type="text"
            placeholder={`Scheduled ${this.state.config.get('name')} configuration`}
            onChange={this.handleName}
            value={this.state.name}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>How ofter do you want to run the configuration</ControlLabel>
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
        name: this.state.name || `Scheduled ${this.state.config.get('name')} configuration`,
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
