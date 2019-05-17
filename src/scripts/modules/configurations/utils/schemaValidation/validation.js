import { List } from 'immutable';
import { object } from 'yup';

export default function(value, schema = object().nullable()) {
  try {
    schema.validateSync(value, { strict: true, abortEarly: false });
  } catch (error) {
    return List(error.errors);
  }

  return List();
}
