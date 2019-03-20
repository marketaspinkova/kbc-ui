import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import PureRendererMixin from 'react-immutable-render-mixin';
import _ from 'underscore';
import { Alert, SplitButton, MenuItem } from 'react-bootstrap';
import { Map } from 'immutable';
import { Link } from 'react-router';
import { Loader, SearchBar } from '@keboola/indigo-ui';
import { factory as eventsFactory } from '../EventsService';
import RoutesStore from '../../../stores/RoutesStore';
import EventsTable from './EventsTable';
import EventDetail from './EventDetail';

export default createReactClass({
  mixins: [PureRendererMixin],

  propTypes: {
    params: PropTypes.object,
    autoReload: PropTypes.bool,
    link: PropTypes.object,
    eventsApi: PropTypes.object
  },

  _handleChange() {
    const currentEventId = RoutesStore.getRouterState().getIn(['query', 'eventId']);

    return this.setState({
      searchQuery: this._events.getQuery(),
      events: this._events.getEvents(),
      currentEventId,
      currentEvent: this._events.getEvent(currentEventId),
      isLoadingCurrentEvent: this._events.getIsLoadingEvent(currentEventId),
      isLoading: this._events.getIsLoading(),
      isLoadingOlder: this._events.getIsLoadingOlder(),
      hasMore: this._events.getHasMore(),
      errorMessage: this._events.getErrorMessage()
    });
  },

  getInitialState() {
    return {
      events: Map(),
      isLoadingOlder: false,
      isLoading: false,
      hasMore: true,
      searchQuery: '',
      searchQueryLocal: '',
      currentEvent: null,
      currentEventId: RoutesStore.getRouterState().getIn(['query', 'eventId'], null),
      isLoadingCurrentEvent: false
    };
  },

  componentDidMount() {
    this._createEventsService(this.props.params, this.props.eventsApi);
    this._events.load();
    this._events.setAutoReload(this.props.autoReload);

    RoutesStore.addChangeListener(this._handleChange);

    if (this.state.currentEventId) {
      return this._events.loadEvent(this.state.currentEventId);
    }
  },

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.params, this.props.params) || !_.isEqual(nextProps.eventsApi, this.props.eventsApi)) {
      this._destroyEventsService();
      this._createEventsService(nextProps.params, nextProps.eventsApi);
      this._events.setQuery(this.state.searchQuery);
      this._events.load();
    }

    return this._events.setAutoReload(nextProps.autoReload);
  },

  componentWillUnmount() {
    this._destroyEventsService();
    return RoutesStore.removeChangeListener(this._handleChange);
  },

  _createEventsService(params, eventsApi) {
    this._events = eventsFactory(params, eventsApi);
    return this._events.addChangeListener(this._handleChange);
  },

  _destroyEventsService() {
    this._events.removeChangeListener(this._handleChange);
    return this._events.reset();
  },

  render() {
    return (
      <div className="form-group">
        <div className="col-xs-12 col-searchbar-padded">
          <SearchBar
            query={this.state.searchQueryLocal}
            onChange={(query) => {
              this.setState({
                searchQueryLocal: query
              });
            }}
            onSubmit={() => this._handleQueryChange(this.state.searchQueryLocal)}
          />
        </div>
        {this.state.currentEventId ? this._renderCurrentEvent() : this._renderEventsList()}
      </div>
    );
  },

  _renderCurrentEvent() {
    if (this.state.currentEvent) {
      return (
        <EventDetail
          link={this.props.link}
          event={this.state.currentEvent}
          isLoading={this.state.isLoading}
        />
      );
    }
    if (this.state.isLoadingCurrentEvent) {
      return (
        <div className="col-xs-12">
          <Loader/> Loading event
        </div>
      );
    }
    return (
      <div className="col-xs-12">
        <Link {...this.props.link}>
          <span className="fa fa-chevron-left"/> Back
        </Link>
        <p>
          Event {this.state.currentEventId} not found.
        </p>
      </div>
    );
  },

  _renderEventsList() {
    if (this.state.errorMessage) {
      return (
        <Alert bsStyle="danger">
          {this.state.errorMessage}
        </Alert>
      );
    }
    if (this.state.events.count()) {
      return (
        <div>
          <EventsTable
            isLoading={this.state.isLoading}
            events={this.state.events}
            onEventSelect={this._handleEventSelect}
            link={this.props.link}
          />
          {this._renderMoreButton()}
        </div>
      );
    }
    return (
      <div className="col-xs-12">
        {this.state.isLoading ? (<span><Loader/> Loading</span>) : 'No events found.'}
      </div>
    );
  },

  _renderMoreButton() {
    if (!this.state.hasMore) {
      return null;
    }

    return (
      <div className="kbc-block-with-padding" style={{ paddingBottom: '30px' }}>
        <SplitButton
          id="load-more-events-button"
          bsStyle="default"
          title={this.state.isLoadingOlder ? 'Loading ...' : 'Load More'}
          onClick={this._handleLoadMore}
          disabled={this.state.isLoadingOlder}
        >
          <MenuItem onClick={this._handleLoadAll}>
            Load All Events
          </MenuItem>
        </SplitButton>
      </div>
    );
  },

  _handleLoadMore() {
    return this._events.loadMore();
  },

  _handleLoadAll() {
    return this._events.loadAll();
  },

  _handleQueryChange(query) {
    this._events.setQuery(query);
    return this._events.load();
  }
});
