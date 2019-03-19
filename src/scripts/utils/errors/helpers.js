import { OperationalError } from 'bluebird';
import HttpError from './HttpError';
import { REQUEST_ABORTED_ERROR } from '../../constants/superagent';
import Error from './Error';
import SimpleError from './SimpleError';

const createPresentationalError = exception => {
  let error = exception;

  if (error instanceof HttpError) {
    return createFromXhrError(error);
  } else if (error.timeout) {
    error = new Error('Request timeout', error.message);
    error.isUserError = true;
    error.id = 'connectTimeout';
    return error;
  } else if (error.code === REQUEST_ABORTED_ERROR) {
    error = new Error('Request timed out', 'Please try again later.');
    error.isUserError = true;
    error.id = 'connectTimeoutRequestAborted';
    return error;
  } else if (error.crossDomain) {
    error = new Error('Not connected to the internet', 'Please try again later.');
    error.id = 'couldNotConnect';
    error.isUserError = true;
    return error;
  } else if (error instanceof OperationalError || error.isOperational) {
    // error from bluebird
    return new Error('Connection error', error.message);
  } else if (error instanceof SimpleError) {
    return new Error(error.title, error.message);
  }

  return new Error('Application error', 'Please try reload the browser.');
};

var createFromXhrError = httpError => {
  let title = 'Error';

  let text = '';
  if (httpError.response.body && httpError.response.body.error && httpError.response.body.error !== 'User error') {
    text = httpError.response.body.error;
  }

  if (httpError.response.body && httpError.response.body.message) {
    title = text;
    text = httpError.response.body.message;
  }

  if (httpError.response.body && httpError.response.body.errorMessage) {
    title = text;
    text = httpError.response.body.errorMessage;
  }

  if (!text) {
    text = 'Application error. Please reload the browser.';
  }

  const error = new Error(
    title,
    text,
    httpError,
    httpError.response.body !== null ? httpError.response.body.exceptionId : null
  );

  if ([400, 401, 403, 404, 409].includes(httpError.response.status)) {
    error.isUserError = true;
  }

  return error;
};

export {
  createPresentationalError
}
