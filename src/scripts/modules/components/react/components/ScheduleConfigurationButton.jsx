import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
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
  { label: 'Once per 5 hours', value: '* */5 * * *' },
  { label: 'Twice a day', value: '* 5,17 * * *' },
  { label: 'Once per day', value: '* 12 * * *' },
  { label: 'Own schedule plan', value: CUSTOM_SCHEDULE_PLAN }
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
      ownCrontabRecord: '0 0 * * *',
      predefinedCrontabRecord: '1 * * * *',
      isLoading: false,
      redirect: false
    };
  },

  render() {
    if (!this.state.config.count()) {
      return null;
    }

    return (
      <Confirm
        title={`Automate ${this.state.config.get('name')} config`}
        text={this.renderBody()}
        buttonType="primary"
        buttonLabel="Automate"
        onConfirm={this.handleSubmit}
        isLoading={this.state.isLoading}
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
          <FormControl
            autoFocus
            componentClass="select"
            onChange={this.handlePredefinedCrobtabRecord}
            value={this.state.predefinedCrontabRecord}
          >
            {scheduleOptions.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </FormControl>
        </FormGroup>
        {this.state.predefinedCrontabRecord === CUSTOM_SCHEDULE_PLAN && (
          <CronScheduler
            crontabRecord={this.state.ownCrontabRecord}
            onChange={this.handleOwnCrobtabRecord}
          />
        )}
      </div>
    );
  },

  handleName(event) {
    this.setState({ name: event.target.value });
  },

  handlePredefinedCrobtabRecord(event) {
    this.setState({ predefinedCrontabRecord: event.target.value });
  },

  handleOwnCrobtabRecord(crontabRecord) {
    this.setState({ ownCrontabRecord: crontabRecord });
  },

  handleSubmit() {
    this.setState({ isLoading: true });
    OrchestrationActionCreators.createOrchestration(
      {
        name: this.state.name || `Scheduled ${this.state.config.get('name')} configuration`,
        crontabRecord:
          this.state.predefinedCrontabRecord === CUSTOM_SCHEDULE_PLAN
            ? this.state.ownCrontabRecord
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
      this.state.redirect
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
