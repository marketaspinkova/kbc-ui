import _ from 'underscore';
import api from './EventsApi';
import { EventsService } from './EventsService';

class TableEventsService extends EventsService {
  constructor(tableId, api1, params) {
    super(api1, params);

    this.tableId = tableId;
  }

  _listEvents(params) {
    return this.api.listTableEvents(this.tableId, _.extend({}, this._getParams(), params));
  }
}

export { TableEventsService };

export function factory(tableId, params, apiParam) {
  return new TableEventsService(tableId, apiParam || api, params);
}