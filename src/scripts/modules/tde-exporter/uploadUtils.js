import _ from 'underscore';
import OrchestrationsStore from '../orchestrations/stores/OrchestrationsStore';
import OrchestrationsActions from '../orchestrations/ActionCreators';
import { fromJS } from 'immutable';

const storageInputFileTemplate = fileId => {
  return {
    input: {
      files: [{ query: `id:${fileId}` }]
    }
  };
};

const componentGetRunJson = {
  'wr-google-drive'(parameters, tdeFile) {
    const account = parameters.get('gdrive');

    return {
      external: {
        account: account.toJS(),
        query: `id:${tdeFile.get('id')}`,
        targetFolder: account.get('targetFolder')
      }
    };
  },

  'wr-tableau-server'(parameters, tdeFile) {
    const storage = storageInputFileTemplate(tdeFile.get('id'));
    const credentials = parameters.get('tableauServer');

    return {
      configData: {
        storage,
        parameters: credentials.toJS()
      }
    };
  }
};

const appendExportTask = (allTasks, configId) => {
  let tasks = allTasks;
  const found = tasks.find(task => {
    const isTde = task.get('component') === 'tde-exporter';
    const hasConfig = task.getIn(['actionParameters', 'config']) === configId;
    return isTde && hasConfig;
  });

  if (!found) {
    const task = {
      component: 'tde-exporter',
      active: true,
      action: 'run',
      actionParameters: {
        config: configId
      }
    };
    tasks = tasks.push(fromJS(task));
  }

  return tasks;
};

const getUploadTaskParameters = (uploadComponentId, account) => {
  switch (uploadComponentId) {
    case 'wr-tableau-server':
      return {
        configData: {
          storage: {
            input: {
              files: [
                {
                  filter_by_run_id: true,
                  tags: ['tde']
                }
              ]
            }
          },
          parameters: account.toJS()
        }
      };

    case 'wr-google-drive':
      const gdrive = account.toJS();

      return {
        external: {
          account: {
            email: gdrive.email,
            accessToken: gdrive.accessToken,
            refreshToken: gdrive.refreshToken
          },
          query: '+tags:tde +tags:table-export',
          filterByRunId: true,
          targetFolder: gdrive.targetFolder
        }
      };

    default:
      return null;
  }
};

const appendUploadTask = (allTasks, uploadComponentId, account, configId) => {
  let tasks = allTasks;
  const tdeIdx = tasks.findIndex(task => {
    const isTde = task.get('component') === 'tde-exporter';
    const hasConfig = task.getIn(['actionParameters', 'config']) === configId;
    return isTde && hasConfig;
  });

  if (tdeIdx === -1) {
    throw Error('TDE task not found');
  }

  const taskParams = getUploadTaskParameters(uploadComponentId, account, configId);
  const task = {
    component: uploadComponentId,
    action: 'run',
    active: true,
    actionParameters: taskParams
  };

  tasks = tasks.splice(tdeIdx + 1, 0, fromJS(task));
  return tasks;
};

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

  isDropboxAuthorized(parameters) {
    const account = parameters ? parameters.get('dropbox') : null;
    return account && account.has('description') && account.has('id');
  },

  isOauthV2Authorized(parameters, componentId) {
    const account = parameters.get(componentId);
    return !!account;
  },

  isGdriveAuthorized(parameters) {
    const account = parameters ? parameters.get('gdrive') : null;

    return (
      account &&
      !_.isEmpty(account.get('accessToken')) &&
      !_.isEmpty(account.get('refreshToken')) &&
      !_.isEmpty(account.get('email'))
    );
  },

  prepareUploadRunParams(componentId, parameters, tdeFile, configId) {
    const getParamsFn = componentGetRunJson[componentId];
    return getParamsFn(parameters, tdeFile, configId);
  },

  appendToOrchestration(orchId, configId, uploadComponentId, account) {
    const orchestrationId = parseInt(orchId, 10);

    return OrchestrationsActions.loadOrchestration(orchestrationId).then(() => {
      let tasks = OrchestrationsStore.getOrchestrationTasks(orchestrationId);
      const orch = OrchestrationsStore.get(orchestrationId);
      tasks = appendExportTask(tasks, configId);
      tasks = appendUploadTask(tasks, uploadComponentId, account, configId);
      OrchestrationsActions.startOrchestrationTasksEdit(orchestrationId);
      OrchestrationsActions.updateOrchestrationsTasksEdit(orchestrationId, tasks);

      return OrchestrationsActions.saveOrchestrationTasks(orchestrationId).then(() => {
        return {
          id: orchestrationId,
          name: orch.get('name')
        };
      });
    });
  }
};
