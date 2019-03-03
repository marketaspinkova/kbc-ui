import React from 'react';
import { List } from 'immutable';
import { startsWith } from 'underscore.string';
import { factory as EventsServiceFactory } from '../../../../sapi-events/EventsService';
import GoodDataStats from './GoodDataStats';

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
    if (!this.state.events || !this.state.events.count()) {
      return this.props.job.getIn(['params', 'tasks'], List()).toJS();
    }

    return this.props.job
      .getIn(['params', 'tasks'], List())
      .map((task, taskId) => {
        return task.set(
          'event',
          this.state.events.find((event) => startsWith(event.get('message'), `Task ${taskId} `))
        );
      })
      .toJS();
  }
});
