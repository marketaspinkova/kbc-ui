import PropTypes from 'prop-types';
import React from 'react';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import { List } from 'immutable';
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
      events: List(),
      isLoading: false
    };
  },

  componentDidMount() {
    this.createEventsService();
    this._events.load();
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
    if (this.state.isLoading) {
      return (
        <p>
          <Loader /> loading graph...
        </p>
      );
    }

    if (!this.state.events.count()) {
      return <p>Graph cannot be rendered, there aren&apos;t any import events.</p>;
    }

    return <LatestImportGraph data={this.state.events} />;
  },

  createEventsService() {
    this._events = eventsFactory(this.props.table.get('id'), { component: 'storage' });
    this._events.setQuery('event:storage.tableImportDone');
    this._events.addChangeListener(this.handleChange);
  },

  destroyEventsService() {
    this._events.removeChangeListener(this.handleChange);
    this._events.reset();
  },

  handleChange() {
    this.setState({
      events: this._events.getEvents(),
      isLoading: this._events.getIsLoading()
    });
  }
});
