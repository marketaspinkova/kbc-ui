import dispatcher from '../../Dispatcher';
import Promise from 'bluebird';
import Store from './RowVersionsStore';
import Api from '../components/InstalledComponentsApi';
import Constants from './RowVersionsConstants';
import ApplicationActionCreators from '../../actions/ApplicationActionCreators';

export default {
  loadVersions: function(componentId, configId, rowId) {
    if (Store.hasVersions(componentId, configId, rowId)) {
      this.loadVersionsForce(componentId, configId, rowId);
      return Promise.resolve();
    }
    return this.loadVersionsForce(componentId, configId, rowId);
  },

  loadVersionsForce: function(componentId, configId, rowId) {
    dispatcher.handleViewAction({
      componentId: componentId,
      configId: configId,
      rowId: rowId,
      type: Constants.ActionTypes.ROW_VERSIONS_LOAD_START
    });
    return Api.getComponentConfigRowVersions(componentId, configId, rowId).then(function(result) {
      dispatcher.handleViewAction({
        componentId: componentId,
        configId: configId,
        rowId: rowId,
        type: Constants.ActionTypes.ROW_VERSIONS_LOAD_SUCCESS,
        versions: result
      });
      return result;
    }).catch(function(error) {
      dispatcher.handleViewAction({
        componentId: componentId,
        configId: configId,
        rowId: rowId,
        type: Constants.ActionTypes.ROW_VERSIONS_LOAD_ERROR
      });
      throw error;
    });
  },

  loadComponentConfigByVersion(componentId, configId, rowId, version) {
    if (Store.hasConfigByVersion(componentId, configId, rowId, version)) {
      return Promise.resolve(Store.getConfigByVersion(componentId, configId, rowId, version));
    }
    return this.loadComponentConfigByVersionForce(componentId, configId, rowId, version);
  },

  loadComponentConfigByVersionForce(componentId, configId, rowId, version) {
    this.pendingStart(componentId, configId, rowId, version, 'config');
    dispatcher.handleViewAction({
      componentId: componentId,
      configId: configId,
      rowId: rowId,
      version: version,
      type: Constants.ActionTypes.ROW_VERSIONS_CONFIG_LOAD_START
    });
    return Api.getComponentConfigRowByVersion(componentId, configId, rowId, version).then((result) => {
      dispatcher.handleViewAction({
        componentId: componentId,
        configId: configId,
        rowId: rowId,
        version: version,
        data: result,
        type: Constants.ActionTypes.ROW_VERSIONS_CONFIG_LOAD_SUCCESS
      });
      this.pendingStop(componentId, configId, rowId);
      return Store.getConfigByVersion(componentId, configId, rowId, version);
    }).catch((error) => {
      dispatcher.handleViewAction({
        componentId: componentId,
        configId: configId,
        rowId: rowId,
        version: version,
        type: Constants.ActionTypes.ROW_VERSIONS_CONFIG_LOAD_ERROR
      });
      throw error;
    });
  },

  loadTwoComponentConfigVersions(componentId, configId, rowId, version1, version2) {
    dispatcher.handleViewAction({
      componentId: componentId,
      configId: configId,
      rowId: rowId,
      pivotVersion: version1,
      type: Constants.ActionTypes.ROW_VERSIONS_MULTI_PENDING_START
    });
    const stopAction = {
      componentId: componentId,
      configId: configId,
      rowId: rowId,
      pivotVersion: version1,
      type: Constants.ActionTypes.ROW_VERSIONS_MULTI_PENDING_STOP
    };
    const v1Promise = this.loadComponentConfigByVersion(componentId, configId, rowId, version1);
    const v2Promise = this.loadComponentConfigByVersion(componentId, configId, rowId, version2);
    return Promise.all([v1Promise, v2Promise])
      .then(() => dispatcher.handleViewAction(stopAction))
      .catch(() => dispatcher.handleViewAction(stopAction));
  },


  rollbackVersion: function(componentId, configId, rowId, version, reloadCallback) {
    var self = this;
    // start spinners
    this.pendingStart(componentId, configId, rowId, version, 'rollback');
    dispatcher.handleViewAction({
      componentId: componentId,
      configId: configId,
      rowId: rowId,
      version: version,
      type: Constants.ActionTypes.ROW_VERSIONS_ROLLBACK_START
    });
    return Api.rollbackRowVersion(componentId, configId, rowId, version).then(function(result) {
      dispatcher.handleViewAction({
        componentId: componentId,
        configId: configId,
        rowId: rowId,
        version: version,
        type: Constants.ActionTypes.ROW_VERSIONS_ROLLBACK_SUCCESS
      });
      // reload versions, not required after sapi update
      var promises = [];
      promises.push(self.loadVersionsForce(componentId, configId, rowId));
      // reload configs!
      promises.push(...reloadCallback(componentId, configId, rowId));
      Promise.all(promises).then(function() {
        // stop spinners
        self.pendingStop(componentId, configId, rowId);
        // notification
        ApplicationActionCreators.sendNotification({
          message: 'Configuration rollback successful'
        });
      }).catch(function(error) {
        throw error;
      });
      return result;
    }).catch(function(error) {
      dispatcher.handleViewAction({
        componentId: componentId,
        configId: configId,
        rowId: rowId,
        version: version,
        type: Constants.ActionTypes.ROW_VERSIONS_ROLLBACK_ERROR
      });
      throw error;
    });
  },

  changeNewVersionName: function(componentId, configId, rowId, version, name) {
    dispatcher.handleViewAction({
      componentId: componentId,
      configId: configId,
      rowId: rowId,
      version: version,
      name: name,
      type: Constants.ActionTypes.ROW_VERSIONS_NEW_NAME_CHANGE
    });
  },

  changeFilter: function(componentId, configId, rowId, query) {
    dispatcher.handleViewAction({
      componentId: componentId,
      configId: configId,
      rowId: rowId,
      query: query,
      type: Constants.ActionTypes.ROW_VERSIONS_FILTER_CHANGE
    });
  },

  pendingStart: function(componentId, configId, rowId, version, action) {
    dispatcher.handleViewAction({
      componentId: componentId,
      configId: configId,
      rowId: rowId,
      version: version,
      action: action,
      type: Constants.ActionTypes.ROW_VERSIONS_PENDING_START
    });
  },

  pendingStop: function(componentId, configId, rowId) {
    dispatcher.handleViewAction({
      componentId: componentId,
      configId: configId,
      rowId: rowId,
      type: Constants.ActionTypes.ROW_VERSIONS_PENDING_STOP
    });
  }
};
