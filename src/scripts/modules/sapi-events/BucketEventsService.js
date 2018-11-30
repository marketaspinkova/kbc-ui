import _ from 'underscore';
import api from './EventsApi';
import { EventsService } from './EventsService';

class BucketEventsService extends EventsService {
  constructor(bucketId, api1, params) {
    super(api1, params);

    this.bucketId = bucketId;
  }

  _listEvents(params) {
    return this.api.listBucketEvents(this.bucketId, _.extend({}, this._getParams(), params));
  }
}

export { BucketEventsService };

export function factory(bucketId, params, apiParam) {
  return new BucketEventsService(bucketId, apiParam || api, params);
}
