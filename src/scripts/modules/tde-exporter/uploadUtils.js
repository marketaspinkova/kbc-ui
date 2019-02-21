import _ from 'underscore';

export default {
  isTableauServerAuthorized(parameters) {
    const account = parameters ? parameters.get('tableauServer') : null;

    return (
      account &&
      !_.isEmpty(account.get('server_url')) &&
      !_.isEmpty(account.get('username')) &&
      !_.isEmpty(account.get('project_name')) &&
      !(_.isEmpty(account.get('password')) && _.isEmpty(account.get('#password')))
    );
  },

  isOauthV2Authorized(parameters, componentId) {
    const account = parameters.get(componentId);
    return !!account;
  }
};
