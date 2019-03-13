import PropTypes from 'prop-types';
import React from 'react';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import { List } from 'immutable';
import { Button } from 'react-bootstrap';
import { RefreshIcon, SearchBar } from '@keboola/indigo-ui';
import { factory as defaultEventsFactory } from '../../../sapi-events/EventsService';
import Tooltip from '../../../../react/common/Tooltip';
import EventsTable from './EventsTable';

const predefinedSearches = [
  {
    name: 'Omit tables fetches',
    query: 'NOT event:storage.tableDataPreview OR NOT event:storage.tableDetail'
  },
  {
    name: 'Omit tables exports',
    query: 'NOT event:storage.tableExported'
  },
  {
    name: 'Import/Exports only',
    query: ['ImportStarted', 'ImportDone', 'ImportError', 'Exported'].map((type) => `event:storage.table${type}`).join(' OR ')
  }
];

export default React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    eventsFactory: PropTypes.object,
    excludeString: PropTypes.string
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
      isRefreshing: false,
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
        <SearchBar
          className="storage-search-bar"
          placeholder="Search events"
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
        <div className="predefined-search-list">
          Predefined searches:{' '}
          {predefinedSearches.map((link, index) => (
            <Button
              key={index}
              bsStyle="link"
              className="btn-link-inline predefined-search-link"
              onClick={() => {
                this.handleQueryChange(link.query, () => {
                  this.handleSearchSubmit();
                })
              }}
            >
              {link.name}
            </Button>
          ))}
        </div>
        <br />
        <EventsTable 
          events={this.state.events} 
          isSearching={this.isSearching()} 
          excludeString={this.props.excludeString} 
        />
        {this.renderMoreButton()}
      </div>
    );
  },

  renderMoreButton() {
    if (!this.state.events.count() || !this.state.hasMore || this.isSearching()) {
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
    const isLoading = this._events.getIsLoading();

    this.setState({
      searchQuery: this._events.getQuery(),
      events: this._events.getEvents(),
      isRefreshing: isLoading && this.state.isRefreshing,
      isLoading,
      isLoadingMore: this._events.getIsLoadingOlder(),
      hasMore: this._events.getHasMore(),
      errorMessage: this._events.getErrorMessage()
    });
  },

  handleRefresh() {
    this.setState({ isRefreshing: true }, () => {
      this._events.load();
    });
  },

  handleLoadMore() {
    this._events.loadMore();
  },

  handleQueryChange(query, thenFn = null) {
    this.setState({ searchQuery: query }, thenFn);
  },

  handleSearchSubmit() {
    this._events.setQuery(this.state.searchQuery);
    this._events.load();
  },

  isSearching() {
    return this.state.isLoading && !this.state.isRefreshing;
  }
});
