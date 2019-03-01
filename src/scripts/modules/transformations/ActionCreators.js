import dispatcher from '../../Dispatcher';
import * as constants from './Constants';
import * as installedComponentsConstants from '../components/Constants';
import transformationsApi from './TransformationsApiAdapter';
import installedComponentsApi from '../components/InstalledComponentsApi';
import TransformationBucketsStore from './stores/TransformationBucketsStore';
import TransformationsStore from './stores/TransformationsStore';
import InstalledComponentsActionCreators from '../components/InstalledComponentsActionCreators';
import RoutesStore from '../../stores/RoutesStore';
import Promise from 'bluebird';
import _ from 'underscore';
import parseQueries from './utils/parseQueries';
import VersionActionCreators from '../components/VersionsActionCreators';
import RowVersionActionCreators from '../configurations/RowVersionsActionCreators';
import ApplicationActionCreators from '../../actions/ApplicationActionCreators';
import StringUtils from '../../utils/string';
import {debounce} from 'lodash';
import {List} from 'immutable';
import restoreTransformationBucketNotification
  from './react/components/notifications/restoreTransformationBucketNotification';
import deleteTransformationBucketNotification
  from './react/components/notifications/deleteTransformationBucketNotification';

const updateTransformationEditingFieldQueriesStringDebouncer = debounce(function(bucketId, transformationId, queriesString) {
  dispatcher.handleViewAction({
    type: constants.ActionTypes.TRANSFORMATION_UPDATE_PARSE_QUERIES_START,
    bucketId: bucketId,
    transformationId: transformationId
  });
  return parseQueries(queriesString).then(function(splitQueries) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.TRANSFORMATION_UPDATE_PARSE_QUERIES_SUCCESS,
      bucketId: bucketId,
      transformationId: transformationId,
      splitQueries: splitQueries
    });
  }).catch(function() {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.TRANSFORMATION_UPDATE_PARSE_QUERIES_ERROR,
      bucketId: bucketId,
      transformationId: transformationId
    });
  });
}, 1000);

const reloadVersions = function(configId, rowId) {
  let promises = [
    VersionActionCreators.loadVersionsForce('transformation', configId)
  ];
  if (rowId) {
    promises.push(RowVersionActionCreators.loadVersionsForce('transformation', configId, rowId));
  }
  return Promise.all(promises);
};

export default {
  createTransformationBucket: function(data) {
    var changeDescription, newBucket;
    newBucket = {};
    changeDescription = 'Create transformation bucket ' + data.name;
    return transformationsApi.createTransformationBucket(data, changeDescription).then(function(bucket) {
      newBucket = bucket;
      return InstalledComponentsActionCreators.loadComponentsForce();
    }).then(function() {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.TRANSFORMATION_BUCKET_CREATE_SUCCESS,
        bucket: newBucket
      });
      VersionActionCreators.loadVersionsForce('transformation', newBucket.id);
      return RoutesStore.getRouter().transitionTo('transformationBucket', {
        config: newBucket.id
      });
    });
  },
  createTransformation: function(bucketId, data) {
    var changeDescription;
    changeDescription = 'Create transformation ' + data.get('name');
    return transformationsApi.createTransformation(bucketId, data.toJS(), changeDescription).then(function(transformation) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.TRANSFORMATION_CREATE_SUCCESS,
        bucketId: bucketId,
        transformation: transformation
      });
      reloadVersions(bucketId, transformation.id);
      return RoutesStore.getRouter().transitionTo('transformationDetail', {
        row: transformation.id,
        config: bucketId
      });
    });
  },
  deleteTransformationBucket: function(bucketId) {
    var actions, bucket;
    actions = this;
    bucket = TransformationBucketsStore.get(bucketId);
    dispatcher.handleViewAction({
      type: constants.ActionTypes.TRANSFORMATION_BUCKET_DELETE,
      bucketId: bucketId
    });
    dispatcher.handleViewAction({
      type: installedComponentsConstants.ActionTypes.INSTALLED_COMPONENTS_DELETE_CONFIGURATION_START,
      componentId: 'transformation',
      configurationId: bucketId,
      transition: false
    });
    return installedComponentsApi.deleteConfiguration('transformation', bucketId).then(function() {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.TRANSFORMATION_BUCKET_DELETE_SUCCESS,
        bucketId: bucketId
      });
      dispatcher.handleViewAction({
        type: installedComponentsConstants.ActionTypes.INSTALLED_COMPONENTS_DELETE_CONFIGURATION_SUCCESS,
        componentId: 'transformation',
        configurationId: bucketId,
        transition: false
      });
      InstalledComponentsActionCreators.loadComponentConfigsData('transformation');
      return ApplicationActionCreators.sendNotification({
        message: deleteTransformationBucketNotification(bucket, actions.restoreTransformationBucket)
      });
    }).catch(function(e) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.TRANSFORMATION_BUCKET_DELETE_ERROR,
        bucketId: bucketId
      });
      dispatcher.handleViewAction({
        type: installedComponentsConstants.ActionTypes.INSTALLED_COMPONENTS_DELETE_CONFIGURATION_ERROR,
        componentId: 'transformation',
        configurationId: bucketId,
        transition: false,
        error: e
      });
      throw e;
    });
  },
  restoreTransformationBucket: function(bucket) {
    const bucketId = bucket.get('id');
    dispatcher.handleViewAction({
      type: constants.ActionTypes.DELETED_TRANSFORMATION_BUCKET_RESTORE,
      bucketId: bucketId
    });
    return transformationsApi.restoreTransformationBucket(bucketId).then(function() {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.DELETED_TRANSFORMATION_BUCKET_RESTORE_SUCCESS,
        bucketId: bucketId
      });
      return InstalledComponentsActionCreators.loadComponentConfigsData('transformation').then(function() {
        return ApplicationActionCreators.sendNotification({
          message: restoreTransformationBucketNotification(bucketId, bucket.get('name'))
        });
      });
    }).catch(function(e) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.DELETED_TRANSFORMATION_BUCKET_RESTORE_ERROR,
        bucketId: bucketId
      });
      throw e;
    });
  },
  deleteTransformation: function(bucketId, transformationId) {
    var changeDescription, transformation;
    dispatcher.handleViewAction({
      type: constants.ActionTypes.TRANSFORMATION_DELETE,
      bucketId: bucketId,
      transformationId: transformationId
    });
    transformation = TransformationsStore.getTransformation(bucketId, transformationId);
    changeDescription = 'Delete transformation ' + transformation.get('name');
    return transformationsApi.deleteTransformation(bucketId, transformationId, changeDescription).then(function() {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.TRANSFORMATION_DELETE_SUCCESS,
        transformationId: transformationId,
        bucketId: bucketId
      });
      InstalledComponentsActionCreators.loadComponentConfigsData('transformation');
      return reloadVersions(bucketId);
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.TRANSFORMATION_DELETE_ERROR,
        transformationId: transformationId,
        bucketId: bucketId
      });
      throw error;
    });
  },

  /*
    Request overview load from server
   */
  loadTransformationOverview: function(bucketId, transformationId, showDisabled) {
    return _.defer(function() {
      var tableId;
      dispatcher.handleViewAction({
        type: constants.ActionTypes.TRANSFORMATION_OVERVIEW_LOAD,
        transformationId: transformationId,
        bucketId: bucketId
      });
      tableId = bucketId + '.' + transformationId;
      return transformationsApi.getGraph({
        tableId: tableId,
        direction: 'around',
        showDisabled: showDisabled,
        limit: {
          sys: [bucketId]
        }
      }).then(function(graphData) {
        return dispatcher.handleViewAction({
          type: constants.ActionTypes.TRANSFORMATION_OVERVIEW_LOAD_SUCCESS,
          transformationId: transformationId,
          bucketId: bucketId,
          model: graphData
        });
      }).catch(function(error) {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.TRANSFORMATION_OVERVIEW_LOAD_ERROR,
          transformationId: transformationId,
          bucketId: bucketId
        });
        throw error;
      });
    });
  },
  showTransformationOverviewDisabled: function(bucketId, transformationId, showDisabled) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.TRANSFORMATION_OVERVIEW_SHOW_DISABLED,
      transformationId: transformationId,
      bucketId: bucketId,
      showDisabled: showDisabled
    });
    return this.loadTransformationOverview(bucketId, transformationId, showDisabled);
  },
  toggleOpenInputMapping: function(bucketId, transformationId, index) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.TRANSFORMATION_INPUT_MAPPING_OPEN_TOGGLE,
      transformationId: transformationId,
      bucketId: bucketId,
      index: index
    });
  },
  toggleOpenOutputMapping: function(bucketId, transformationId, index) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.TRANSFORMATION_OUTPUT_MAPPING_OPEN_TOGGLE,
      transformationId: transformationId,
      bucketId: bucketId,
      index: index
    });
  },
  changeTransformationProperty: function(bucketId, transformationId, propertyName, newValue, changeDescription) {
    var pendingAction, transformation, finalChangeDescription;
    finalChangeDescription = changeDescription;
    pendingAction = 'save-' + propertyName;
    dispatcher.handleViewAction({
      type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_START,
      transformationId: transformationId,
      bucketId: bucketId,
      pendingAction: pendingAction
    });
    transformation = TransformationsStore.getTransformation(bucketId, transformationId);
    transformation = transformation.set(propertyName, newValue);
    if (!changeDescription) {
      finalChangeDescription = 'Change ' + StringUtils.capitalize(propertyName) + ' in ' + transformation.get('name');
    }
    return transformationsApi.saveTransformation(bucketId, transformationId, transformation.toJS(), finalChangeDescription).then(function(response) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_SUCCESS,
        transformationId: transformationId,
        bucketId: bucketId,
        editingId: propertyName,
        pendingAction: pendingAction,
        data: response
      });
      return reloadVersions(bucketId, transformationId);
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_ERROR,
        transformationId: transformationId,
        bucketId: bucketId,
        editingId: propertyName,
        pendingAction: pendingAction,
        error: error
      });
      throw error;
    });
  },
  deleteTransformationProperty: function(bucketId, transformationId, propertyName, changeDescription) {
    let finalChangeDescription = changeDescription;
    const pendingAction = 'save-' + propertyName;
    dispatcher.handleViewAction({
      type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_START,
      transformationId: transformationId,
      bucketId: bucketId,
      pendingAction: pendingAction
    });
    let transformation = TransformationsStore.getTransformation(bucketId, transformationId);
    transformation = transformation.delete(propertyName);
    if (!changeDescription) {
      finalChangeDescription = 'Delete ' + StringUtils.capitalize(propertyName) + ' in ' + transformation.get('name');
    }
    return transformationsApi.saveTransformation(bucketId, transformationId, transformation.toJS(), finalChangeDescription).then(function(response) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_SUCCESS,
        transformationId: transformationId,
        bucketId: bucketId,
        editingId: propertyName,
        pendingAction: pendingAction,
        data: response
      });
      return reloadVersions(bucketId, transformationId);
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_ERROR,
        transformationId: transformationId,
        bucketId: bucketId,
        editingId: propertyName,
        pendingAction: pendingAction,
        error: error
      });
      throw error;
    });
  },
  setTransformationBucketsFilter: function(query) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.TRANSFORMATION_BUCKETS_FILTER_CHANGE,
      filter: query
    });
  },
  toggleBucket: function(bucketId) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.TRANSFORMATION_BUCKETS_TOGGLE,
      bucketId: bucketId
    });
  },
  startTransformationFieldEdit: function(bucketId, transformationId, fieldId) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.TRANSFORMATION_START_EDIT_FIELD,
      bucketId: bucketId,
      transformationId: transformationId,
      fieldId: fieldId
    });
  },
  updateTransformationEditingField: function(bucketId, transformationId, fieldId, newValue) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.TRANSFORMATION_UPDATE_EDITING_FIELD,
      bucketId: bucketId,
      transformationId: transformationId,
      fieldId: fieldId,
      newValue: newValue
    });
  },
  updateTransformationEditingFieldQueriesString: function(bucketId, transformationId, queriesString) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.TRANSFORMATION_UPDATE_PARSE_QUERIES,
      bucketId: bucketId,
      transformationId: transformationId,
      queriesString: queriesString
    });
    return updateTransformationEditingFieldQueriesStringDebouncer(bucketId, transformationId, queriesString);
  },
  cancelTransformationEditingField: function(bucketId, transformationId, fieldId) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.TRANSFORMATION_CANCEL_EDITING_FIELD,
      bucketId: bucketId,
      transformationId: transformationId,
      fieldId: fieldId
    });
  },

  saveTransformationQueries: function(bucketId, transformationId) {
    var transformation = TransformationsStore.getTransformation(bucketId, transformationId);
    const transformationEditingFields = TransformationsStore.getTransformationEditingFields(bucketId, transformationId);
    const pendingAction = 'save-queries';
    const changeDescription = transformationEditingFields.get('description', 'Change Queries in ' + transformation.get('name'));
    transformation = transformation.set('queries', transformationEditingFields.get('splitQueries'));
    dispatcher.handleViewAction({
      type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_START,
      transformationId: transformationId,
      bucketId: bucketId,
      pendingAction: pendingAction
    });
    return transformationsApi.saveTransformation(bucketId, transformationId, transformation.toJS(), changeDescription).then(function(response) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_SUCCESS,
        transformationId: transformationId,
        bucketId: bucketId,
        editingId: 'queries',
        pendingAction: pendingAction,
        data: response
      });
      return reloadVersions(bucketId, transformationId);
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_ERROR,
        transformationId: transformationId,
        bucketId: bucketId,
        editingId: 'queries',
        pendingAction: pendingAction,
        error: error
      });
      throw error;
    });
  },

  saveTransformationScript: function(bucketId, transformationId) {
    var transformation = TransformationsStore.getTransformation(bucketId, transformationId);
    const transformationEditingFields = TransformationsStore.getTransformationEditingFields(bucketId, transformationId);
    const pendingAction = 'save-queries';
    const changeDescription = transformationEditingFields.get('description', 'Change Scripts in ' + transformation.get('name'));
    transformation = transformation.set('queries', List([transformationEditingFields.get('queriesString')]));
    dispatcher.handleViewAction({
      type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_START,
      transformationId: transformationId,
      bucketId: bucketId,
      pendingAction: pendingAction
    });
    return transformationsApi.saveTransformation(bucketId, transformationId, transformation.toJS(), changeDescription).then(function(response) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_SUCCESS,
        transformationId: transformationId,
        bucketId: bucketId,
        editingId: 'queries',
        pendingAction: pendingAction,
        data: response
      });
      return reloadVersions(bucketId, transformationId);
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_ERROR,
        transformationId: transformationId,
        bucketId: bucketId,
        editingId: 'queries',
        pendingAction: pendingAction,
        error: error
      });
      throw error;
    });
  },

  saveTransformationEditingField: function(bucketId, transformationId, fieldId, changeDescription) {
    var pendingAction, transformation, value, finalChangeDescription;
    finalChangeDescription = changeDescription;
    value = TransformationsStore.getTransformationEditingFields(bucketId, transformationId).get(fieldId);
    transformation = TransformationsStore.getTransformation(bucketId, transformationId);
    transformation = transformation.set(fieldId, value);
    if (!finalChangeDescription) {
      finalChangeDescription = 'Change ' + StringUtils.capitalize(fieldId) + ' in ' + transformation.get('name');
    }
    pendingAction = 'save-' + fieldId;
    dispatcher.handleViewAction({
      type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_START,
      transformationId: transformationId,
      bucketId: bucketId,
      pendingAction: pendingAction
    });
    return transformationsApi.saveTransformation(bucketId, transformationId, transformation.toJS(), finalChangeDescription).then(function(response) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_SUCCESS,
        transformationId: transformationId,
        bucketId: bucketId,
        editingId: fieldId,
        pendingAction: pendingAction,
        data: response
      });
      return reloadVersions(bucketId, transformationId);
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_ERROR,
        transformationId: transformationId,
        bucketId: bucketId,
        editingId: fieldId,
        pendingAction: pendingAction,
        error: error
      });
      throw error;
    });
  },

  /*
    Create new or update existing output mapping
   */
  saveTransformationMapping: function(bucketId, transformationId, mappingType, editingId, mappingIndex = null) {
    var changeDescription, mapping, transformation;
    mapping = TransformationsStore.getTransformationEditingFields(bucketId, transformationId).get(editingId);
    transformation = TransformationsStore.getTransformation(bucketId, transformationId);
    if (mappingIndex === null) {
      changeDescription = 'Create ' + mappingType + ' mapping in ' + transformation.get('name');
    } else {
      changeDescription = 'Update ' + mappingType + ' mapping in ' + transformation.get('name');
    }
    transformation = transformation.update(mappingType, function(mappings) {
      if (mappingIndex !== null) {
        return mappings.set(mappingIndex, mapping);
      } else {
        return mappings.push(mapping);
      }
    });
    if (!mapping) {
      return Promise.resolve();
    }
    const pendingAction = `save-${mappingType}`;

    dispatcher.handleViewAction({
      type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_START,
      transformationId: transformationId,
      bucketId: bucketId,
      pendingAction
    });

    return transformationsApi.saveTransformation(bucketId, transformationId, transformation.toJS(), changeDescription).then(function(response) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_SUCCESS,
        transformationId: transformationId,
        bucketId: bucketId,
        editingId: editingId,
        data: response,
        pendingAction
      });
      return reloadVersions(bucketId, transformationId);
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_ERROR,
        transformationId: transformationId,
        bucketId: bucketId,
        error: error,
        pendingAction
      });
      throw error;
    });
  },
  deleteTransformationMapping: function(bucketId, transformationId, mappingType, mappingIndex) {
    var changeDescription, pendingAction, transformation;
    transformation = TransformationsStore.getTransformation(bucketId, transformationId);
    transformation = transformation.update(mappingType, function(mappings) {
      return mappings.delete(mappingIndex);
    });
    changeDescription = 'Delete ' + mappingType + ' mapping in ' + transformation.get('name');
    pendingAction = 'delete-' + mappingType + '-' + mappingIndex;
    dispatcher.handleViewAction({
      type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_START,
      transformationId: transformationId,
      bucketId: bucketId,
      pendingAction: pendingAction
    });
    return transformationsApi.saveTransformation(bucketId, transformationId, transformation.toJS(), changeDescription).then(function(response) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_SUCCESS,
        transformationId: transformationId,
        bucketId: bucketId,
        data: response,
        pendingAction: pendingAction
      });
      return reloadVersions(bucketId, transformationId);
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_ERROR,
        transformationId: transformationId,
        bucketId: bucketId,
        pendingAction: pendingAction,
        error: error
      });
      throw error;
    });
  }
};
