class SimpleError extends Error {
  constructor(title, message) {
    super(message);
    this.title = title;
  }
}

export default SimpleError;
