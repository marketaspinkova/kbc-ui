import React, { PropTypes } from 'react';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import { List } from 'immutable';
import { Button } from 'react-bootstrap';
import { SearchBar } from '@keboola/indigo-ui';
import { factory as eventsFactory } from '../../../../sapi-events/BucketEventsService';
import EventsTable from '../../components/EventsTable';

export default React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    bucket: PropTypes.object.isRequired
  },

  getInitialState() {
    return {
      events: List(),
      isLoadingMore: false,
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
        <div className="kbc-inner-padding">
          <SearchBar
            query={this.state.searchQuery}
            onChange={this.handleQueryChange}
            onSubmit={this.handleSearchSubmit}
          />
        </div>
        <EventsTable events={this.state.events} />
        {this.renderMoreButton()}
      </div>
    );
  },

  renderMoreButton() {
    if (!this.state.events || !this.state.hasMore) {
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
    this._events = eventsFactory(this.props.bucket.get('id'));
    this._events.addChangeListener(this.handleChange);
  },

  destroyEventsService() {
    this._events.removeChangeListener(this.handleChange);
    this._events.reset();
  },

  handleChange() {
    if (this.isMounted()) {
      this.setState({
        searchQuery: this._events.getQuery(),
        events: this._events.getEvents(),
        isLoading: this._events.getIsLoading(),
        isLoadingMore: this._events.getIsLoadingOlder(),
        hasMore: this._events.getHasMore(),
        errorMessage: this._events.getErrorMessage()
      });
    }
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
