import request from '../../../utils/request';
import AdminActionError from '../../../utils/errors/AdminActionError';

const createRequest = () => {
  return request('POST', '/admin/index/send-wishlist-request');
};

const sendWishlistRequest = (params) => {
  return createRequest()
    .type('form')
    .send(params)
    .promise()
    .then(
      () => {
        // this is empty, because successful action doesn't return any data
      },
      (error) => {
        if (error.response && error.response.body && error.response.body.errors) {
          throw new AdminActionError(error.response.body.errors);
        }
        throw error;
      }
    );
};

export {
  sendWishlistRequest
}
