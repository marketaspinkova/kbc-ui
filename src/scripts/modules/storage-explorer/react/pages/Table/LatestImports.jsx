import React, { PropTypes } from 'react';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import { Map } from 'immutable';
import { Loader } from '@keboola/indigo-ui';
import { factory as eventsFactory } from '../../../../sapi-events/TableEventsService';
import LatestImportGraph from '../../components/LatestImportGraph';

export default React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    table: PropTypes.object.isRequired
  },

  getInitialState() {
    return {
      events: Map(),
      loading: false
    };
  },

  componentDidMount() {
    this.createEventsService();
    this.loadEvents();
  },

  componentWillUnmount() {
    this.destroyEventsService();
  },

  render() {
    return (
      <div>
        <h2>Latest imports</h2>
        {this.renderImportsTableGraph()}
      </div>
    );
  },

  renderImportsTableGraph() {
    if (this.state.loading) {
      return (
        <p>
          <Loader /> loading...
        </p>
      );
    }

    if (!this.state.events.count()) {
      return <p>Graph cannot be rendered, there aren't any import events.</p>;
    }

    return <LatestImportGraph data={this.state.events} />;
  },

  createEventsService() {
    this._events = eventsFactory(this.props.table.get('id'), { component: 'storage' });
    this._events.setQuery('event:storage.tableImportDone');
  },

  destroyEventsService() {
    this._events.reset();
  },

  loadEvents() {
    this.setState({ loading: true });

    this._events
      .load()
      .then(() => {
        this.setState({ events: this._events.getEvents() });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  }
});
