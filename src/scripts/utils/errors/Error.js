//
// Error object used for presentation in error page.
// You should not throw/return this error directly. Check ./helpers.js file.
//
export default class Error {
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
