import { array, boolean, object, string } from 'yup';

export default object().shape({
  before: array().of(object()),
  after: array().of(
    object().shape({
      definition: object().shape({
        component: string()
      }),
      parameters: object().shape({
        delimiter: string(),
        enclosure: string(),
        incremental: boolean(),
        primary_key: array(),
        columns: array()
      })
    })
  )
});
