import { OperationalError } from 'bluebird';
import HttpError from './HttpError';

const abortedCodes = ['ECONNABORTED', 'ABORTED'];

/*
  Error object used for presentation in error page
*/
class Error {
  constructor(title, text, data, exceptionId) {
    this.title = title;
    this.text = text;
    this.data = data;
    this.exceptionId = exceptionId;
    this.id = null;
    this.isUserError = false;
  }

  getTitle() {
    return this.title;
  }

  getText() {
    return this.text;
  }

  data() {
    return this.data;
  }

  getExceptionId() {
    return this.exceptionId;
  }
}

const createFromException = exception => {
  let error = exception;

  if (error instanceof HttpError) {
    return createFromXhrError(error);
  } else if (error.timeout || abortedCodes.includes(error.code)) {
    error = new Error('Request aborted', 'Slow network detected. Application may not work properly.');
    error.isUserError = true;
    error.id = 'connectTimeout';
    return error;
  } else if (error.crossDomain) {
    error = new Error('Not connected to internet', 'Please try again later.');
    error.id = 'couldNotConnect';
    error.isUserError = true;
    return error;
  } else if (error instanceof OperationalError || error.isOperational) {
    // error from bluebird
    return new Error('Connection error', error.message);
  }

  return new Error('Application error', 'Please try reload the browser');
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

export default {
  Error,
  create: createFromException
};
