import React from 'react';
import { factory as EventsServiceFactory } from '../../../../sapi-events/EventsService';
import GoodDataStats from './GoodDataStats';
import _ from 'underscore';
import { startsWith } from 'underscore.string';
import { List } from 'immutable';

export default React.createClass({
  propTypes: {
    job: React.PropTypes.object.isRequired
  },

  getInitialState() {
    const es = EventsServiceFactory({ runId: this.props.job.get('runId') });
    es.setQuery('type:success OR type:error');
    es.setLimit(100);

    return {
      eventService: es,
      events: List()
    };
  },

  _handleEventsChange() {
    const events = this.state.eventService.getEvents();

    this.setState({
      events
    });

    if (this.props.job.get('isFinished') === true) {
      this.state.eventService.stopAutoReload();
    } else {
      this.state.eventService.startAutoReload();
    }
  },

  componentWillUnmount() {
    this.state.eventService.stopAutoReload();
    this.state.eventService.removeChangeListener(this._handleEventsChange);
  },

  componentDidMount() {
    this.state.eventService.addChangeListener(this._handleEventsChange);
    this.state.eventService.load();
  },

  render() {
    return <GoodDataStats tasks={this._getTaskEvents()} />;
  },

  _getTaskEvents() {
    const events = this.state.events.toJS();
    const tasks = this.props.job.getIn(['params', 'tasks']).toJS();

    return _.map(tasks, (task, taskId) => {
      const msg = `Task ${taskId} `;
      const event = _.find(_.values(events), item => startsWith(item.message, msg));
      task.event = event;
      return task;
    });
  }
});
