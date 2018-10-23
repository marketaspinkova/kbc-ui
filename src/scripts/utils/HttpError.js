/* eslint-disable */
class HttpError extends Error {
  constructor(response) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) {
        super();
      }
      let thisFn = (() => {
        return this;
      }).toString();
      let thisName = thisFn.slice(thisFn.indexOf('return') + 6 + 1, thisFn.indexOf(';')).trim();
      eval(`${thisName} = this;`);
    }
    this.response = response;
    this.message = this.response.body != null ? this.response.body.error : undefined;
  }
}

export default HttpError;
