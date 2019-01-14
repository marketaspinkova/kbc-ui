import React, { PropTypes } from 'react';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import { List } from 'immutable';
import { Button, Row } from 'react-bootstrap';
import { RefreshIcon, SearchBar } from '@keboola/indigo-ui';
import { factory as defaultEventsFactory } from '../../../sapi-events/EventsService';
import Tooltip from '../../../../react/common/Tooltip';
import EventsTable from './EventsTable';

export default React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    eventsFactory: PropTypes.object
  },

  getDefaultProps() {
    return {
      eventsFactory: defaultEventsFactory()
    };
  },

  getInitialState() {
    return {
      events: List(),
      isLoadingMore: false,
      isLoading: false,
      hasMore: true,
      searchQuery: ''
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
        <div style={{margin: '1em 1em 1em 0'}}>
          <SearchBar
            placeholder="Search event"
            query={this.state.searchQuery}
            onChange={this.handleQueryChange}
            onSubmit={this.handleSearchSubmit}
            additionalActions={
              <Tooltip tooltip="Refresh events" placement="top">
                <Button onClick={this.handleRefresh}>
                  <RefreshIcon isLoading={this.state.isLoading} title="" />
                </Button>
              </Tooltip>
            }
          />
        </div>
        <Row>
          <EventsTable events={this.state.events} />
        </Row>
        {this.renderMoreButton()}
      </div>
    );
  },

  renderMoreButton() {
    if (this.state.isLoading || !this.state.events || !this.state.hasMore) {
      return null;
    }

    return (
      <div className="kbc-block-with-padding">
        <Button onClick={this.handleLoadMore} disabled={this.state.isLoadingMore}>
          {this.state.isLoadingMore ? 'Loading ...' : 'Load more'}
        </Button>
      </div>
    );
  },

  createEventsService() {
    this._events = this.props.eventsFactory;
    this._events.addChangeListener(this.handleChange);
  },

  destroyEventsService() {
    this._events.removeChangeListener(this.handleChange);
    this._events.reset();
  },

  handleChange() {
    this.setState({
      searchQuery: this._events.getQuery(),
      events: this._events.getEvents(),
      isLoading: this._events.getIsLoading(),
      isLoadingMore: this._events.getIsLoadingOlder(),
      hasMore: this._events.getHasMore(),
      errorMessage: this._events.getErrorMessage()
    });
  },

  handleRefresh() {
    this._events.load();
  },

  handleLoadMore() {
    this._events.loadMore();
  },

  handleQueryChange(query) {
    this.setState({
      searchQuery: query
    });
  },

  handleSearchSubmit() {
    this._events.setQuery(this.state.searchQuery);
    this._events.load();
  }
});
