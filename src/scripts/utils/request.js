import request, { Request } from 'superagent';
import Promise from 'bluebird';
import HttpError from './HttpError';
import qs from 'qs';

request.serialize['application/x-www-form-urlencoded'] = function(data) {
  return qs.stringify(data);
};

Request.prototype.promise = function() {
  const req = this;
  return new Promise(function(resolve, reject) {
    return req
      .then(
        responseOk => {
          return resolve(responseOk);
        },
        responseNotOk => {
          if (responseNotOk.response) {
            return reject(new HttpError(responseNotOk.response));
          } else {
            return reject(responseNotOk);
          }
        }
      )
      .catch(error => {
        return reject(error);
      });
  });
};

module.exports = function(method, url) {
  return request(method, url).timeout(60000);
};
