import { List } from 'immutable';

export default function(value, schema) {
  try {
    schema.validateSync(value, { strict: true, abortEarly: false });
  } catch (error) {
    return List(error.errors);
  }

  return List();
}
