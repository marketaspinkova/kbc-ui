import { boolean, object, string } from 'yup';
import processors from '../../configurations/utils/schemaValidation/processors';

export default object()
  .nullable()
  .shape({
    parameters: object().shape({
      bucket: string(),
      key: string(),
      includeSubfolders: boolean(),
      newFilesOnly: boolean()
    }),
    processors
  });
