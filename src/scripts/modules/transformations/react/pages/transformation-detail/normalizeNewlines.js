
export default (value) => {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
};
