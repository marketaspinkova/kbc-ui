import Promise from 'bluebird';
import StorageTokensStore from './StorageTokensStore';
import storageApi from '../components/StorageApi';
import dispatcher from '../../Dispatcher';
import constants from './constants';
import {fromJS} from 'immutable';

const ActionTypes = constants.ActionTypes;


export default {
  updateLocalState(newLocalState) {
    dispatcher.handleViewAction({
      type: ActionTypes.STORAGE_TOKEN_UPDATE_LOCALSTATE,
      localState: newLocalState
    });
  },

  deleteToken(tokenObject) {
    const tokenId = tokenObject.get('id');
    dispatcher.handleViewAction({
      type: ActionTypes.STORAGE_TOKEN_DELETE,
      tokenId: tokenId
    });
    return storageApi.deleteToken(tokenId).then(() => {
      dispatcher.handleViewAction({
        type: ActionTypes.STORAGE_TOKEN_DELETE_SUCCESS,
        tokenId: tokenId
      });
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: ActionTypes.STORAGE_TOKEN_DELETE_ERROR,
        error: error,
        tokenId: tokenId
      });
      throw error;
    });
  },

  refreshToken(tokenObject) {
    const tokenId = tokenObject.get('id');
    dispatcher.handleViewAction({
      type: ActionTypes.STORAGE_TOKEN_REFRESH,
      tokenId: tokenId
    });
    return storageApi.refreshToken(tokenId).then((newToken) => {
      const newTokenMap = fromJS(newToken);
      dispatcher.handleViewAction({
        type: ActionTypes.STORAGE_TOKEN_REFRESH_SUCCESS,
        tokenId: tokenId,
        newToken: newTokenMap
      });
      return newTokenMap;
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: ActionTypes.STORAGE_TOKEN_REFRESH_ERROR,
        error: error,
        tokenId: tokenId
      });
      throw error;
    });
  },

  sendToken(tokenId, params) {
    const {email, message} = params;
    dispatcher.handleViewAction({
      type: ActionTypes.STORAGE_TOKEN_SEND,
      tokenId: tokenId
    });
    return storageApi.shareToken(tokenId, email, message).then(() => {
      dispatcher.handleViewAction({
        type: ActionTypes.STORAGE_TOKEN_SEND_SUCCESS,
        tokenId: tokenId
      });
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: ActionTypes.STORAGE_TOKEN_SEND_ERROR,
        error: error,
        tokenId: tokenId
      });
      throw error;
    });
  },


  loadTokensForce() {
    dispatcher.handleViewAction({
      type: ActionTypes.STORAGE_TOKENS_LOAD
    });
    return storageApi.getTokens().then((tokens) => {
      dispatcher.handleViewAction({
        type: ActionTypes.STORAGE_TOKENS_LOAD_SUCCESS,
        tokens: tokens
      });
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: ActionTypes.STORAGE_TOKENS_LOAD_ERROR,
        error: error
      });
      throw error;
    });
  },

  loadTokens() {
    if (StorageTokensStore.getIsLoaded()) {
      return Promise.resolve();
    }
    return this.loadTokensForce();
  },

  createToken(params) {
    return storageApi.createToken(params).then((createdToken) => {
      const token = fromJS(createdToken);
      dispatcher.handleViewAction({
        type: ActionTypes.STORAGE_TOKEN_CREATE_SUCCESS,
        token: token
      });
      return token;
    }).catch((error) => {
      dispatcher.handleViewAction({
        type: ActionTypes.STORAGE_TOKEN_CREATE_ERROR,
        status: error.status,
        response: error.response
      });
      throw error;
    });
  },

  updateToken(tokenId, params) {
    if (params.componentAccess && params.componentAccess.length === 0) {
      params.componentAccess = null;
    }
    if (params.canManageBuckets) {
      delete params.componentAccess;
      delete params.bucketPermissions;
    }
    return storageApi.updateToken(tokenId, params).then((updatedToken) => {
      const token = fromJS(updatedToken);
      dispatcher.handleViewAction({
        type: ActionTypes.STORAGE_TOKEN_UPDATE_SUCCESS,
        tokenId: tokenId,
        token: token
      });
      return token;
    }).catch((error) => {
      dispatcher.handleViewAction({
        type: ActionTypes.STORAGE_TOKEN_CREATE_ERROR,
        status: error.status,
        response: error.response
      });
      throw error;
    });
  }

};
