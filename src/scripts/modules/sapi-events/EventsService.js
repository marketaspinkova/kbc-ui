import Immutable, {Map} from 'immutable';
import { EventEmitter } from 'events';
import _ from 'underscore';
import timer from '../../utils/Timer';
import api from './EventsApi';

const CHANGE_EVENT = 'change';

class EventsService {
  constructor(api1, defaultParams) {
    this.loadNew = this.loadNew.bind(this);
    this.api = api1;
    this.defaultParams = defaultParams;
    this._emmiter = new EventEmitter();
    this._autoReload = false;
    this.reset();
  }

  reset() {
    this._events = Map();
    this._eventsDetails = Map();
    this._query = '';
    this._isLoading = false;
    this._loadingEvents = Map();
    this._loadingOlder = false;
    this._hasMore = true;
    this._timer = timer;
    this._errorMessage = null;
    this.stopAutoReload();
    this._emitChange();
    this._limit = 50;
  }

  setParams(params) {
    this.defaultParams = params;
    return this.reset();
  }

  setQuery(query) {
    this._query = query;
  }

  setLimit(limit) {
    this._limit = limit;
  }

  setAutoReload(flag) {
    if (flag) {
      return this.startAutoReload();
    } else {
      return this.stopAutoReload();
    }
  }

  stopAutoReload() {
    if (!this._autoReload) { return; }
    this._autoReload = false;
    return this._timer.stop(this.loadNew);
  }

  startAutoReload() {
    if (this._autoReload) { return; }
    this._autoReload = true;
    return this._timer.poll(this.loadNew, 5, false);
  }

  loadEvent(id) {
    const intId = parseInt(id, 10);

    if (this._events.has(intId)) {
      return;
    }

    if (this.getIsLoadingEvent(intId)) {
      return;
    }

    this._loadingEvents = this._loadingEvents.set(intId, true);
    return this.api
      .getEvent(intId)
      .then(this._loadEventSuccess.bind(this))
      .catch(this._loadEventError.bind(this, intId));
  }

  _loadEventSuccess(event) {
    this._loadingEvents = this._loadingEvents.delete(event.id);
    this._eventsDetails = this._eventsDetails.merge(this._convertEvents([event]));
    this._emitChange();
  }

  _loadEventError(eventId) {
    this._loadingEvents = this._loadingEvents.delete(eventId);
    this._emitChange();
  }

  load() {
    this._isLoading = true;
    this._errorMessage = null;
    this._emitChange();
    return this._listEvents()
      .then(this._setEvents.bind(this))
      .catch(this._onLoadError.bind(this));
  }

  _onLoadError(error) {
    this._events = Map();
    return this._onError(error);
  }

  loadNew() {
    this._isLoading = true;
    this._errorMessage = null;
    this._emitChange();

    const event = this.getEvents().first();
    const params = { limit: 10 };

    if (event && event.has('id')) {
      params.sinceId = event.get('id');
    }

    return this._listEvents(params)
      .then(this._prependEvents.bind(this))
      .catch(this._onError.bind(this));
  }

  loadMore() {
    this._loadingOlder = true;
    this._errorMessage = null;
    this._emitChange();

    return this._listEvents({
      maxId: this.getEvents().last().get('id')
    }).then(this._appendEvents.bind(this))
      .catch(this._onError.bind(this));
  }

  _onError(error) {
    this._loadingOlder = false;
    this._isLoading = false;
    this._errorMessage = error.message;
    return this._emitChange();
  }

  _getParams() {
    return _.extend({}, this.defaultParams, {
      q: this._query,
      limit: this._limit
    });
  }

  _listEvents(params) {
    return this.api
      .listEvents(_.extend({}, this._getParams(), params));
  }

  getEvents() {
    return this._events
      .toSeq()
      .sortBy(event => event.get('id') * -1);
  }

  getEvent(id) {
    const eventId = parseInt(id, 10);
    if (this._eventsDetails.has(eventId)) {
      return this._eventsDetails.get(eventId);
    }
    return this._events.get(eventId);
  }

  getIsLoadingOlder() {
    return this._loadingOlder;
  }

  getIsLoading() {
    return this._isLoading;
  }

  getIsLoadingEvent(id) {
    return this._loadingEvents.has(parseInt(id, 10));
  }

  getHasMore() {
    return this._hasMore;
  }

  getQuery() {
    return this._query;
  }

  getErrorMessage() {
    return this._errorMessage;
  }

  _setEvents(events) {
    this._isLoading = false;
    this._events = this._convertEvents(events);
    if (events.length < this._limit) {
      this._hasMore = false;
    }
    return this._emitChange();
  }

  _prependEvents(events) {
    this._isLoading = false;
    if (events.length) {
      this._events = this._events.merge(this._convertEvents(events));
    }
    return this._emitChange();
  }

  _appendEvents(events) {
    this._loadingOlder = false;
    this._events = this._events.merge(this._convertEvents(events));
    if (!events.length) { this._hasMore = false; }
    return this._emitChange();
  }

  _convertEvents(eventsRaw) {
    return Immutable
      .fromJS(eventsRaw)
      .toMap()
      .mapKeys((key, event) => event.get('id'));
  }

  _emitChange() {
    return this._emmiter.emit(CHANGE_EVENT);
  }

  addChangeListener(callback) {
    return this._emmiter.on(CHANGE_EVENT, callback);
  }

  removeChangeListener(callback) {
    return this._emmiter.removeListener(CHANGE_EVENT, callback);
  }
}

export { EventsService };

export function factory(params, apiParam) {
  return new EventsService(apiParam || api, params);
}
