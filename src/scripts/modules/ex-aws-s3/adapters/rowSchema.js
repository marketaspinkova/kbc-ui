import { array, boolean, object, string } from 'yup';

export default object()
  .nullable()
  .shape({
    parameters: object().shape({
      bucket: string(),
      key: string(),
      includeSubfolders: boolean(),
      newFilesOnly: boolean()
    }),
    processors: object().shape({
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
    })
  });
