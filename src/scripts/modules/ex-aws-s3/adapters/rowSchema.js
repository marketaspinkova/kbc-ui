import { boolean, object, array } from 'yup';

export default object()
  .nullable()
  .shape({
    parameters: object(),
    processors: object().shape({
      after: array().of(
        object().shape({
          definition: object(),
          parameters: object().shape({
            incremental: boolean(),
            columns: array()
          })
        })
      )
    })
  });
