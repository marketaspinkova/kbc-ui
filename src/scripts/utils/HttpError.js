class HttpError extends Error {
  constructor(response) {
    super();
    this.response = response;
    if (this.response.body) {
      this.message = this.response.body.error;
    }
  }
}

export default HttpError;
