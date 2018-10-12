import _ from 'underscore';
import credentialsTemplates from './templates/credentialsFields';

export default {
  defaultCredentials(componentId, driver, baseCredentials) {
    let credentials = baseCredentials;
    credentials = credentials.set('driver', driver);

    credentialsTemplates(componentId).forEach(input => {
      if (input[4] !== null) {
        credentials = credentials.set(input[1], credentials.get(input[1], input[4]));
      }
    });

    return credentials;
  },

  hasDbConnection(componentId, credentials) {
    const fields = credentialsTemplates(componentId);
    const result = _.reduce(
      fields,
      (memo, field) => {
        const propName = field[1];
        const isHashed = propName[0] === '#';
        const isRequired = field[6];
        return memo && (!isRequired || !!credentials.get(propName) || isHashed);
      },
      !!credentials
    );
    return result;
  }
};
