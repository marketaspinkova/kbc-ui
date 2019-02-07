import dispatcher from '../../Dispatcher';
import constants from './Constants';
import provisioningApi from './ProvisioningApi';
import redshiftSandboxCredentialsStore from './stores/RedshiftSandboxCredentialsStore';
import snowflakeSandboxCredentialsStore from './stores/SnowflakeSandboxCredentialsStore';
import rStudioSandboxCredentialsStore from './stores/RStudioSandboxCredentialsStore';
import jupyterSandboxCredentialsStore from './stores/JupyterSandboxCredentialsStore';
import WrDbCredentialsStore from './stores/WrDbCredentialsStore';
import Promise from 'bluebird';
import HttpError from '../../utils/HttpError';

export default {
  getRedshiftBackend: function() {
    return 'redshift-workspace';
  },

  /*
  Request specified orchestration load from server
  @return Promise
   */
  loadRedshiftSandboxCredentialsForce: function() {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.CREDENTIALS_REDSHIFT_SANDBOX_LOAD
    });
    return provisioningApi.getCredentials(this.getRedshiftBackend(), 'sandbox').then(function(response) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.CREDENTIALS_REDSHIFT_SANDBOX_LOAD_SUCCESS,
        touch: response.touch,
        credentials: response.credentials
      });
    }).catch(HttpError, function(error) {
      if (error.response.status === 404) {
        return dispatcher.handleViewAction({
          type: constants.ActionTypes.CREDENTIALS_REDSHIFT_SANDBOX_LOAD_SUCCESS,
          credentials: {
            id: null
          }
        });
      } else {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.CREDENTIALS_REDSHIFT_SANDBOX_LOAD_ERROR
        });
        throw error;
      }
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.CREDENTIALS_REDSHIFT_SANDBOX_LOAD_ERROR
      });
      throw error;
    });
  },

  loadRedshiftSandboxCredentials: function() {
    if (redshiftSandboxCredentialsStore.getIsLoaded()) {
      return Promise.resolve();
    }
    return this.loadRedshiftSandboxCredentialsForce();
  },

  createRedshiftSandboxCredentials: function() {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.CREDENTIALS_REDSHIFT_SANDBOX_CREATE
    });
    return provisioningApi.createCredentials(this.getRedshiftBackend(), 'sandbox', null, {
      noRefresh: true,
      restrictTime: true
    }).then(function(response) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.CREDENTIALS_REDSHIFT_SANDBOX_CREATE_SUCCESS,
        touch: response.touch,
        credentials: response.credentials
      });
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.CREDENTIALS_REDSHIFT_SANDBOX_CREATE_ERROR
      });
      throw error;
    });
  },

  dropRedshiftSandboxCredentials: function() {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.CREDENTIALS_REDSHIFT_SANDBOX_DROP
    });
    return provisioningApi.dropCredentials(this.getRedshiftBackend(), redshiftSandboxCredentialsStore.getCredentials().get('id')).then(function() {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.CREDENTIALS_REDSHIFT_SANDBOX_DROP_SUCCESS
      });
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.CREDENTIALS_REDSHIFT_SANDBOX_DROP_ERROR
      });
      throw error;
    });
  },

  refreshRedshiftSandboxCredentials: function() {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.CREDENTIALS_REDSHIFT_SANDBOX_REFRESH
    });
    return provisioningApi.createCredentials(this.getRedshiftBackend(), 'sandbox').then(function(response) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.CREDENTIALS_REDSHIFT_SANDBOX_REFRESH_SUCCESS,
        touch: response.touch,
        credentials: response.credentials
      });
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.CREDENTIALS_REDSHIFT_SANDBOX_REFRESH_ERROR
      });
      throw error;
    });
  },

  /*
   WR DB CREDENTIALS ACTIONS
   */
  loadWrDbCredentialsForce: function(permissionType, token, driver) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.CREDENTIALS_WRDB_LOAD,
      permission: permissionType,
      token: token
    });
    return provisioningApi.getCredentials(driver, permissionType, token).then(function(response) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.CREDENTIALS_WRDB_LOAD_SUCCESS,
        credentials: response.credentials,
        touch: response.touch,
        permission: permissionType,
        token: token
      });
    }).catch(HttpError, function(error) {
      if (error.response.status === 404) {
        return dispatcher.handleViewAction({
          type: constants.ActionTypes.CREDENTIALS_WRDB_LOAD_SUCCESS,
          credentials: null,
          permission: permissionType,
          token: token
        });
      } else {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.CREDENTIALS_WRDB_LOAD_ERROR,
          permission: permissionType,
          token: token
        });
        throw error;
      }
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.CREDENTIALS_WRDB_LOAD_ERROR,
        permission: permissionType,
        token: token
      });
      throw error;
    });
  },

  loadWrDbCredentials: function(permissionType, token, driver) {
    var isLoaded;
    isLoaded = WrDbCredentialsStore.getIsLoaded(permissionType, token);
    if (isLoaded) {
      return Promise.resolve();
    }
    return this.loadWrDbCredentialsForce(permissionType, token, driver);
  },

  createWrDbCredentials: function(permissionType, token, driver) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.CREDENTIALS_WRDB_CREATE,
      permission: permissionType,
      token: token
    });
    return provisioningApi.createCredentials(driver, permissionType, token).then(function(response) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.CREDENTIALS_WRDB_CREATE_SUCCESS,
        credentials: response.credentials,
        touch: response.touch,
        permission: permissionType,
        token: token
      });
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.CREDENTIALS_WRDB_CREATE_ERROR,
        permission: permissionType,
        token: token
      });
      throw error;
    });
  },

  dropWrDbCredentials: function(permissionType, token, driver) {
    var credentials;
    dispatcher.handleViewAction({
      type: constants.ActionTypes.CREDENTIALS_WRDB_DROP,
      permission: permissionType,
      token: token
    });
    credentials = WrDbCredentialsStore.getCredentials(permissionType, token);
    return provisioningApi.dropCredentials(driver, credentials.get('id'), token).then(function() {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.CREDENTIALS_WRDB_DROP_SUCCESS,
        permission: permissionType,
        token: token
      });
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.CREDENTIALS_WRDB_DROP_ERROR,
        permission: permissionType,
        token: token
      });
      throw error;
    });
  },

  /*
  Request specified orchestration load from server
  @return Promise
   */
  loadSnowflakeSandboxCredentialsForce: function() {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.CREDENTIALS_SNOWFLAKE_SANDBOX_LOAD
    });
    return provisioningApi.getCredentials('snowflake', 'sandbox').then(function(response) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.CREDENTIALS_SNOWFLAKE_SANDBOX_LOAD_SUCCESS,
        touch: response.touch,
        credentials: response.credentials
      });
    }).catch(HttpError, function(error) {
      if (error.response.status === 404) {
        return dispatcher.handleViewAction({
          type: constants.ActionTypes.CREDENTIALS_SNOWFLAKE_SANDBOX_LOAD_SUCCESS,
          credentials: {
            id: null
          }
        });
      } else {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.CREDENTIALS_SNOWFLAKE_SANDBOX_LOAD_ERROR
        });
        throw error;
      }
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.CREDENTIALS_SNOWFLAKE_SANDBOX_LOAD_ERROR
      });
      throw error;
    });
  },

  loadSnowflakeSandboxCredentials: function() {
    if (snowflakeSandboxCredentialsStore.getIsLoaded()) {
      return Promise.resolve();
    }
    return this.loadSnowflakeSandboxCredentialsForce();
  },

  createSnowflakeSandboxCredentials: function() {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.CREDENTIALS_SNOWFLAKE_SANDBOX_CREATE
    });
    return provisioningApi.createCredentials('snowflake', 'sandbox').then(function(response) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.CREDENTIALS_SNOWFLAKE_SANDBOX_CREATE_SUCCESS,
        touch: response.touch,
        credentials: response.credentials
      });
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.CREDENTIALS_SNOWFLAKE_SANDBOX_CREATE_ERROR
      });
      throw error;
    });
  },

  dropSnowflakeSandboxCredentials: function() {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.CREDENTIALS_SNOWFLAKE_SANDBOX_DROP
    });
    return provisioningApi.dropCredentials('snowflake', snowflakeSandboxCredentialsStore.getCredentials().get('id')).then(function() {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.CREDENTIALS_SNOWFLAKE_SANDBOX_DROP_SUCCESS
      });
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.CREDENTIALS_SNOWFLAKE_SANDBOX_DROP_ERROR
      });
      throw error;
    });
  },


  loadRStudioSandboxCredentials: function() {
    if (rStudioSandboxCredentialsStore.getIsLoaded()) {
      return Promise.resolve();
    }
    return this.loadRStudioSandboxCredentialsForce();
  },


  /*
  Request specified orchestration load from server
  @return Promise
   */
  loadRStudioSandboxCredentialsForce: function() {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.CREDENTIALS_RSTUDIO_SANDBOX_LOAD
    });
    return provisioningApi.getCredentials('docker', 'rstudio').then(function(response) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.CREDENTIALS_RSTUDIO_SANDBOX_LOAD_SUCCESS,
        touch: response.touch,
        credentials: response.credentials
      });
    }).catch(HttpError, function(error) {
      if (error.response.status === 404) {
        return dispatcher.handleViewAction({
          type: constants.ActionTypes.CREDENTIALS_RSTUDIO_SANDBOX_LOAD_SUCCESS,
          credentials: {
            id: null
          }
        });
      } else {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.CREDENTIALS_RSTUDIO_SANDBOX_LOAD_ERROR
        });
        throw error;
      }
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.CREDENTIALS_RSTUDIO_SANDBOX_LOAD_ERROR
      });
      throw error;
    });
  },

  createRStudioSandboxCredentials: function(data, options) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.CREDENTIALS_RSTUDIO_SANDBOX_CREATE_JOB
    });
    return provisioningApi.createCredentialsAsync('docker', 'rstudio', data, options).then(function(response) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.CREDENTIALS_RSTUDIO_SANDBOX_CREATE_JOB_SUCCESS,
        touch: response.touch,
        credentials: response.credentials
      });
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.CREDENTIALS_RSTUDIO_SANDBOX_CREATE_JOB_ERROR
      });
      throw error;
    });
  },

  dropRStudioSandboxCredentials: function() {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.CREDENTIALS_RSTUDIO_SANDBOX_DROP_JOB
    });
    return provisioningApi.dropCredentialsAsync('docker', rStudioSandboxCredentialsStore.getCredentials().get('id')).then(function() {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.CREDENTIALS_RSTUDIO_SANDBOX_DROP_JOB_SUCCESS
      });
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.CREDENTIALS_RSTUDIO_SANDBOX_DROP_JOB_ERROR
      });
      throw error;
    });
  },

  extendRStudioSandboxCredentials: function() {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.CREDENTIALS_RSTUDIO_SANDBOX_EXTEND
    });
    return provisioningApi.extendCredentials('docker', rStudioSandboxCredentialsStore.getCredentials().get('id')).then(function(response) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.CREDENTIALS_RSTUDIO_SANDBOX_EXTEND_SUCCESS,
        touch: response.touch
      });
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.CREDENTIALS_RSTUDIO_SANDBOX_EXTEND_ERROR
      });
      throw error;
    });
  },

  loadJupyterSandboxCredentials: function() {
    if (jupyterSandboxCredentialsStore.getIsLoaded()) {
      return Promise.resolve();
    }
    return this.loadJupyterSandboxCredentialsForce();
  },


  /*
  Request specified orchestration load from server
  @return Promise
   */
  loadJupyterSandboxCredentialsForce: function() {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.CREDENTIALS_JUPYTER_SANDBOX_LOAD
    });
    return provisioningApi.getCredentials('docker', 'jupyter').then(function(response) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.CREDENTIALS_JUPYTER_SANDBOX_LOAD_SUCCESS,
        touch: response.touch,
        credentials: response.credentials
      });
    }).catch(HttpError, function(error) {
      if (error.response.status === 404) {
        return dispatcher.handleViewAction({
          type: constants.ActionTypes.CREDENTIALS_JUPYTER_SANDBOX_LOAD_SUCCESS,
          credentials: {
            id: null
          }
        });
      } else {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.CREDENTIALS_JUPYTER_SANDBOX_LOAD_ERROR
        });
        throw error;
      }
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.CREDENTIALS_JUPYTER_SANDBOX_LOAD_ERROR
      });
      throw error;
    });
  },

  createJupyterSandboxCredentials: function(data, options) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.CREDENTIALS_JUPYTER_SANDBOX_CREATE_JOB
    });
    return provisioningApi.createCredentialsAsync('docker', 'jupyter', data, options).then(function(response) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.CREDENTIALS_JUPYTER_SANDBOX_CREATE_JOB_SUCCESS,
        touch: response.touch,
        credentials: response.credentials
      });
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.CREDENTIALS_JUPYTER_SANDBOX_CREATE_JOB_ERROR
      });
      throw error;
    });
  },

  dropJupyterSandboxCredentials: function() {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.CREDENTIALS_JUPYTER_SANDBOX_DROP_JOB
    });
    return provisioningApi.dropCredentialsAsync('docker', jupyterSandboxCredentialsStore.getCredentials().get('id')).then(function() {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.CREDENTIALS_JUPYTER_SANDBOX_DROP_JOB_SUCCESS
      });
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.CREDENTIALS_JUPYTER_SANDBOX_DROP_JOB_ERROR
      });
      throw error;
    });
  },

  extendJupyterSandboxCredentials: function() {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.CREDENTIALS_JUPYTER_SANDBOX_EXTEND
    });
    return provisioningApi.extendCredentials('docker', jupyterSandboxCredentialsStore.getCredentials().get('id')).then(function(response) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.CREDENTIALS_JUPYTER_SANDBOX_EXTEND_SUCCESS,
        touch: response.touch
      });
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.CREDENTIALS_JUPYTER_SANDBOX_EXTEND_ERROR
      });
      throw error;
    });
  }
};
