class HttpError extends Error {
  constructor(response) {
    super();
    this.response = response;

    if (this.response.body) {
      this.message = this.response.body.error || this.response.body.message || this.response.body.errorMessage;
    }
  }
}

export default HttpError;
