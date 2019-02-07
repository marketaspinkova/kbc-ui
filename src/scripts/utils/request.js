import request, { Request } from 'superagent';
import Promise from 'bluebird';
import HttpError from './HttpError';
import qs from 'qs';

request.serialize['application/x-www-form-urlencoded'] = (data) => {
  return qs.stringify(data);
};

Request.prototype.promise = function() {
  return new Promise((resolve, reject) => {
    return this.then(
      (responseOk) => {
        return resolve(responseOk);
      },
      (responseNotOk) => {
        if (responseNotOk.response) {
          return reject(new HttpError(responseNotOk.response));
        } else {
          return reject(responseNotOk);
        }
      }
    ).catch((error) => {
      return reject(error);
    });
  });
};

export default (method, url) => {
  return request(method, url).timeout(60000);
};
