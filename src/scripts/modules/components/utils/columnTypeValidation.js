export const validate = (type, value) => {
  if (['binary', 'char', 'character', 'string', 'text', 'varchar'].includes(type)) {
    if (!/^(?!0)[0-9]+$/.test(value)) {
      return false;
    }
  }

  if (['decimal', 'number', 'numeric'].includes(type)) {
    if (!/^(?!0)[0-9]+(?:,?[0-9]+)?$/.test(value)) {
      return false;
    }
  }

  if (type === 'time') {
    if (!/^[0-9]$/.test(value)) {
      return false;
    }
  }

  return true;
};

export default {
  validate
};
