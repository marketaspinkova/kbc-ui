import dispatcher from '../../Dispatcher';
import Promise from 'bluebird';
import Store from './stores/VersionsStore';
import Api from './InstalledComponentsApi';
import Constants from './VersionsConstants';
import ApplicationActionCreators from '../../actions/ApplicationActionCreators';
import PropTypes from 'prop-types';
import React from 'react';
import ConfigurationCopiedNotification from './react/components/ConfigurationCopiedNotification';

export default {
  loadVersions: function(componentId, configId) {
    if (Store.hasVersions(componentId, configId)) {
      this.loadVersionsForce(componentId, configId);
      return Promise.resolve();
    }
    return this.loadVersionsForce(componentId, configId);
  },

  loadVersionsForce: function(componentId, configId) {
    dispatcher.handleViewAction({
      componentId: componentId,
      configId: configId,
      type: Constants.ActionTypes.VERSIONS_LOAD_START
    });
    return Api.getComponentConfigVersions(componentId, configId).then(function(result) {
      dispatcher.handleViewAction({
        componentId: componentId,
        configId: configId,
        type: Constants.ActionTypes.VERSIONS_LOAD_SUCCESS,
        versions: result
      });
      return result;
    }).catch(function(error) {
      dispatcher.handleViewAction({
        componentId: componentId,
        configId: configId,
        type: Constants.ActionTypes.VERSIONS_LOAD_ERROR
      });
      throw error;
    });
  },


  loadComponentConfigByVersion(componentId, configId, version) {
    if (Store.hasConfigByVersion(componentId, configId, version)) {
      return Promise.resolve(Store.getConfigByVersion(componentId, configId, version));
    }
    return this.loadComponentConfigByVersionForce(componentId, configId, version);
  },

  loadComponentConfigByVersionForce(componentId, configId, version) {
    this.pendingStart(componentId, configId, version, 'config');
    dispatcher.handleViewAction({
      componentId: componentId,
      configId: configId,
      version: version,
      type: Constants.ActionTypes.VERSIONS_CONFIG_LOAD_START
    });
    return Api.getComponentConfigByVersion(componentId, configId, version).then((result) => {
      dispatcher.handleViewAction({
        componentId: componentId,
        configId: configId,
        version: version,
        data: result,
        type: Constants.ActionTypes.VERSIONS_CONFIG_LOAD_SUCCESS
      });
      this.pendingStop(componentId, configId);
      return Store.getConfigByVersion(componentId, configId, version);
    }).catch((error) => {
      dispatcher.handleViewAction({
        componentId: componentId,
        configId: configId,
        version: version,
        type: Constants.ActionTypes.VERSIONS_CONFIG_LOAD_ERROR
      });
      throw error;
    });
  },

  loadTwoComponentConfigVersions(componentId, configId, version1, version2) {
    dispatcher.handleViewAction({
      componentId: componentId,
      configId: configId,
      pivotVersion: version1,
      type: Constants.ActionTypes.VERSIONS_MULTI_PENDING_START
    });
    const stopAction = {
      componentId: componentId,
      configId: configId,
      pivotVersion: version1,
      type: Constants.ActionTypes.VERSIONS_MULTI_PENDING_STOP
    };
    const v1Promise = this.loadComponentConfigByVersion(componentId, configId, version1);
    const v2Promise = this.loadComponentConfigByVersion(componentId, configId, version2);
    return Promise.all([v1Promise, v2Promise])
      .then(() => dispatcher.handleViewAction(stopAction))
      .catch(() => dispatcher.handleViewAction(stopAction));
  },


  rollbackVersion: function(componentId, configId, version, reloadCallback) {
    var self = this;
    // start spinners
    this.pendingStart(componentId, configId, version, 'rollback');
    dispatcher.handleViewAction({
      componentId: componentId,
      configId: configId,
      version: version,
      type: Constants.ActionTypes.VERSIONS_ROLLBACK_START
    });
    return Api.rollbackVersion(componentId, configId, version).then(function(result) {
      dispatcher.handleViewAction({
        componentId: componentId,
        configId: configId,
        version: version,
        type: Constants.ActionTypes.VERSIONS_ROLLBACK_SUCCESS
      });
      // reload versions, not required after sapi update
      var promises = [];
      promises.push(self.loadVersionsForce(componentId, configId));
      // reload configs!
      promises.push(...reloadCallback(componentId, configId));
      Promise.all(promises).then(function() {
        // stop spinners
        self.pendingStop(componentId, configId);
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
        version: version,
        type: Constants.ActionTypes.VERSIONS_ROLLBACK_ERROR
      });
      throw error;
    });
  },

  copyVersion: function(componentId, configId, version, name, reloadCallback) {
    var self = this;
    // start spinners
    this.pendingStart(componentId, configId, version, 'copy');
    dispatcher.handleViewAction({
      componentId: componentId,
      configId: configId,
      version: version,
      name: name,
      type: Constants.ActionTypes.VERSIONS_COPY_START
    });
    return Api.createConfigCopy(componentId, configId, version, name).then(function(result) {
      dispatcher.handleViewAction({
        componentId: componentId,
        configId: configId,
        version: version,
        name: name,
        type: Constants.ActionTypes.VERSIONS_COPY_SUCCESS
      });

      var promises = [];
      // reload versions, not required after sapi update
      promises.push(self.loadVersionsForce(componentId, configId));

      // reload configs!
      promises.push(...reloadCallback(componentId));

      Promise.all(promises).then(function() {
        // stop spinners
        self.pendingStop(componentId, configId);
        // send notification
        ApplicationActionCreators.sendNotification({
          message: React.createClass({
            propTypes: {
              onClick: PropTypes.func
            },

            render() {
              return (
                <ConfigurationCopiedNotification
                  componentId={componentId}
                  configId={result.id}
                  onClick={this.props.onClick}
                />
              );
            }
          })
        });
      }).catch(function(error) {
        throw error;
      });
      return result;
    }).catch(function(error) {
      dispatcher.handleViewAction({
        componentId: componentId,
        configId: configId,
        version: version,
        name: name,
        type: Constants.ActionTypes.VERSIONS_COPY_ERROR
      });
      throw error;
    });
  },

  changeNewVersionName: function(componentId, configId, version, name) {
    dispatcher.handleViewAction({
      componentId: componentId,
      configId: configId,
      version: version,
      name: name,
      type: Constants.ActionTypes.VERSIONS_NEW_NAME_CHANGE
    });
  },

  changeFilter: function(componentId, configId, query) {
    dispatcher.handleViewAction({
      componentId: componentId,
      configId: configId,
      query: query,
      type: Constants.ActionTypes.VERSIONS_FILTER_CHANGE
    });
  },

  pendingStart: function(componentId, configId, version, action) {
    dispatcher.handleViewAction({
      componentId: componentId,
      configId: configId,
      version: version,
      action: action,
      type: Constants.ActionTypes.VERSIONS_PENDING_START
    });
  },

  pendingStop: function(componentId, configId) {
    dispatcher.handleViewAction({
      componentId: componentId,
      configId: configId,
      type: Constants.ActionTypes.VERSIONS_PENDING_STOP
    });
  }
};
