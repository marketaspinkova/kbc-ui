import { ActionTypes } from './constants';
import Promise from 'bluebird';
import api from './api';
import dispatcher from '../../Dispatcher';
import store from './wrGdriveStore';

export default {
  loadFiles(configId) {
    if (store.getFiles(configId)) {
      return Promise.resolve();
    } else {
      return this.loadFilesForce(configId);
    }
  },

  saveFile(configId, tableId, file) {
    let apiOperation;
    dispatcher.handleViewAction({
      type: ActionTypes.WR_GDRIVE_SAVEFILE_START,
      tableId,
      file,
      configId
    });
    const fileId = file && file.get('id');
    if (fileId) {
      apiOperation = api.putFile(configId, fileId, file.toJS());
    } else {
      apiOperation = api.postFile(configId, file);
    }

    return apiOperation
      .then((result) =>
        dispatcher.handleViewAction({
          type: ActionTypes.WR_GDRIVE_SAVEFILE_SUCCESS,
          tableId,
          configId,
          files: result
        })
      )
      .catch(function(err) {
        dispatcher.handleViewAction({
          type: ActionTypes.WR_GDRIVE_API_ERROR,
          configId,
          error: err
        });
        throw err;
      });
  },

  setGoogleInfo(configId, googleId, info) {
    return dispatcher.handleViewAction({
      type: ActionTypes.WR_GDRIVE_LOAD_GOOGLEINFO_SUCCESS,
      googleInfo: info,
      googleId,
      configId
    });
  },

  loadFilesForce(configId) {
    return api
      .getAccount(configId)
      .then(function(result) {
        dispatcher.handleViewAction({
          type: ActionTypes.WR_GDRIVE_LOAD_FILES_SUCCESS,
          configId,
          files: result.items
        });
        return dispatcher.handleViewAction({
          type: ActionTypes.WR_GDRIVE_LOAD_ACCOUNT_SUCCESS,
          configId,
          account: result
        });
      })
      .catch(function(err) {
        dispatcher.handleViewAction({
          type: ActionTypes.WR_GDRIVE_API_ERROR,
          configId,
          error: err
        });
        throw err;
      });
  },

  deleteRow(configId, rowId, tableId) {
    dispatcher.handleViewAction({
      type: ActionTypes.WR_GDRIVE_DELETE_ROW_START,
      configId,
      tableId
    });
    return api
      .deleteFile(configId, rowId)
      .then(() =>
        dispatcher.handleViewAction({
          type: ActionTypes.WR_GDRIVE_DELETE_ROW_SUCCESS,
          configId,
          tableId
        })
      )
      .catch(function(err) {
        dispatcher.handleViewAction({
          type: ActionTypes.WR_GDRIVE_API_ERROR,
          configId,
          error: err
        });
        throw err;
      });
  },

  loadGoogleInfo(configId, googleId) {
    const isLoading = store.getLoadingGoogleInfo(configId, googleId);
    if (!!isLoading) {
      return;
    }

    dispatcher.handleViewAction({
      type: ActionTypes.WR_GDRIVE_LOAD_GOOGLEINFO_START,
      googleId,
      configId
    });
    return api
      .getFileInfo(configId, googleId)
      .then((result) =>
        dispatcher.handleViewAction({
          type: ActionTypes.WR_GDRIVE_LOAD_GOOGLEINFO_SUCCESS,
          googleInfo: result,
          googleId,
          configId
        })
      )
      .catch(function(err) {
        dispatcher.handleViewAction({
          type: ActionTypes.WR_GDRIVE_API_ERROR,
          googleId,
          configId,
          error: err
        });
        throw err;
      });
  },

  setEditingData(configId, path, data) {
    return dispatcher.handleViewAction({
      type: ActionTypes.WR_GDRIVE_SET_EDITING,
      configId,
      path,
      data
    });
  }
};
