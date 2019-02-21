import Promise from 'bluebird';
import _ from 'underscore';
import dispatcher from '../../Dispatcher';
import * as constants from './constants';
import goodDataWriterStore from './store';
import goodDataWriterApi from './api';
import jobPoller from '../../utils/jobPoller';
import installedComponentsApi from '../components/InstalledComponentsApi';
import applicationStore from '../../stores/ApplicationStore';
import applicationActionCreators from '../../actions/ApplicationActionCreators';
import dimensionsStore from './dateDimensionsStore';

// notifications
import dataSetSynchronizationInitiated from './react/notifications/dataSetSynchronizationInitiated';
import dimensionUploadInitiated from './react/notifications/dimensionUploadInitiated';
import projectScheduledToReset from './react/notifications/projectScheduledToReset';
import sliHashesOptimizationTriggered from './react/notifications/sliHashesOptimizationTriggered';
import tableResetInitiated from './react/notifications/tableResetInitiated';
import tableUploadInitiated from './react/notifications/tableUploadInitiated';
import uploadInitiated from './react/notifications/uploadInitiated';

export default {
  deleteTable(configurationId, tableId) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.GOOD_DATA_WRITER_TABLE_DELETE_START,
      configurationId,
      tableId
    });
    return goodDataWriterApi
      .deleteWriterTable(configurationId, tableId)
      .then(() =>
        dispatcher.handleViewAction({
          type: constants.ActionTypes.GOOD_DATA_WRITER_TABLE_DELETE_SUCCESS,
          configurationId,
          tableId
        })
      )
      .catch(function(error) {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.GOOD_DATA_WRITER_TABLE_DELETE_ERROR,
          configurationId,
          tableId
        });
        throw error;
      });
  },

  addNewTable(configurationId, tableId, data) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.GOOD_DATA_WRITER_TABLE_ADD_START,
      configurationId,
      tableId,
      data
    });
    return goodDataWriterApi.addWriterTable(configurationId, tableId, data).then(() => {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.GOOD_DATA_WRITER_TABLE_ADD_SUCCESS,
        configurationId,
        tableId,
        data
      });
      return Promise.props({
        tableDetail: this.loadTableDetail(configurationId, tableId),
        refTables: this.loadReferencableTables(configurationId)
      }).catch(function(error) {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.GOOD_DATA_WRITER_TABLE_ADD_ERROR,
          configurationId,
          tableId,
          data
        });
        throw error;
      });
    });
  },

  loadConfigurationForce(configurationId) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.GOOD_DATA_WRITER_LOAD_START,
      configurationId
    });

    return Promise.props({
      id: configurationId,
      writer: goodDataWriterApi.getWriter(configurationId),
      tables: goodDataWriterApi.getWriterTables(configurationId)
    })
      .then((configuration) =>
        dispatcher.handleViewAction({
          type: constants.ActionTypes.GOOD_DATA_WRITER_LOAD_SUCCESS,
          configuration
        })
      )
      .catch(function(error) {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.GOOD_DATA_WRITER_LOAD_ERROR,
          configurationId
        });
        throw error;
      });
  },

  loadConfiguration(configurationId) {
    if (goodDataWriterStore.hasWriter(configurationId)) {
      this.loadConfigurationForce(configurationId);
      return Promise.resolve();
    }
    return this.loadConfigurationForce(configurationId);
  },

  loadTableDetailForce(configurationId, tableId) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.GOOD_DATA_WRITER_LOAD_TABLE_START,
      configurationId
    });

    return goodDataWriterApi
      .getTableDetail(configurationId, tableId)
      .then((table) =>
        dispatcher.handleViewAction({
          type: constants.ActionTypes.GOOD_DATA_WRITER_LOAD_TABLE_SUCCESS,
          configurationId,
          table
        })
      )
      .catch(function(error) {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.GOOD_DATA_WRITER_LOAD_TABLE_ERROR,
          configurationId,
          tableId
        });
        throw error;
      });
  },

  loadTableDetail(configurationId, tableId) {
    if (goodDataWriterStore.hasTableColumns(configurationId, tableId)) {
      this.loadTableDetailForce(configurationId, tableId);
      return Promise.resolve();
    }
    return this.loadTableDetailForce(configurationId, tableId);
  },

  toggleBucket(configurationId, bucketId) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.GOOD_DATA_WRITER_SET_BUCKET_TOGGLE,
      configurationId,
      bucketId
    });
  },

  loadReferencableTablesForce(configurationId) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.GOOD_DATA_WRITER_LOAD_REFERENCABLE_TABLES_START,
      configurationId
    });

    return goodDataWriterApi
      .getReferenceableTables(configurationId)
      .then((tables) =>
        dispatcher.handleViewAction({
          type: constants.ActionTypes.GOOD_DATA_WRITER_LOAD_REFERENCABLE_TABLES_SUCCESS,
          configurationId,
          tables
        })
      )
      .catch(function(error) {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.GOOD_DATA_WRITER_LOAD_REFERENCABLE_TABLES_ERROR,
          configurationId,
          error
        });
        throw error;
      });
  },

  loadReferencableTables(configurationId) {
    if (goodDataWriterStore.hasReferenceableTables(configurationId)) {
      return Promise.resolve();
    } else {
      return this.loadReferencableTablesForce(configurationId);
    }
  },

  optimizeSLIHash(configurationId, pid) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.GOOD_DATA_WRITER_SLI_START,
      configurationId
    });

    return goodDataWriterApi
      .optimizeSLIHash(configurationId, pid)
      .then(function(job) {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.GOOD_DATA_WRITER_SLI_SUCCESS,
          configurationId
        });
        return applicationActionCreators.sendNotification({
          message: sliHashesOptimizationTriggered(job)
        });
      })
      .catch(function(e) {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.GOOD_DATA_WRITER_SLI_ERROR,
          configurationId,
          error: e
        });
        throw e;
      });
  },

  resetProject(configurationId, pid) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.GOOD_DATA_WRITER_RESET_PROJECT_START,
      configurationId
    });

    return goodDataWriterApi
      .resetProject(configurationId, pid)
      .then(function(job) {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.GOOD_DATA_WRITER_RESET_PROJECT_SUCCESS,
          configurationId
        });
        return applicationActionCreators.sendNotification({
          message: projectScheduledToReset(job)
        });
      })
      .catch(function(e) {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.GOOD_DATA_WRITER_RESET_PROJECT_ERROR,
          configurationId,
          error: e
        });
        throw e;
      });
  },

  saveMultipleTableFields(configurationId, tableId, fields) {
    _.map(fields, (newValue, fieldName) =>
      dispatcher.handleViewAction({
        type: constants.ActionTypes.GOOD_DATA_WRITER_SAVE_TABLE_FIELD_START,
        configurationId,
        tableId,
        field: fieldName,
        value: newValue
      })
    );
    return goodDataWriterApi
      .updateTable(configurationId, tableId, fields)
      .then(() =>
        _.map(fields, (newValue, fieldName) =>
          dispatcher.handleViewAction({
            type: constants.ActionTypes.GOOD_DATA_WRITER_SAVE_TABLE_FIELD_SUCCESS,
            configurationId,
            tableId,
            field: fieldName,
            value: newValue
          })
        )
      )
      .catch(function(e) {
        _.map(fields, (newValue, fieldName) =>
          dispatcher.handleViewAction({
            type: constants.ActionTypes.GOOD_DATA_WRITER_SAVE_TABLE_FIELD_ERROR,
            configurationId,
            tableId,
            field: fieldName,
            value: newValue,
            error: e
          })
        );
        throw e;
      });
  },

  saveTableField(configurationId, tableId, fieldName, newValue) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.GOOD_DATA_WRITER_SAVE_TABLE_FIELD_START,
      configurationId,
      tableId,
      field: fieldName,
      value: newValue
    });

    const saveFieldName = fieldName;

    const data = {};
    data[saveFieldName] = newValue;
    return goodDataWriterApi
      .updateTable(configurationId, tableId, data)
      .then(() =>
        dispatcher.handleViewAction({
          type: constants.ActionTypes.GOOD_DATA_WRITER_SAVE_TABLE_FIELD_SUCCESS,
          configurationId,
          tableId,
          field: fieldName,
          value: newValue
        })
      )
      .catch(function(e) {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.GOOD_DATA_WRITER_SAVE_TABLE_FIELD_ERROR,
          configurationId,
          tableId,
          field: fieldName,
          value: newValue,
          error: e
        });
        throw e;
      });
  },

  startTableFieldEdit(configurationId, tableId, field) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.GOOD_DATA_WRITER_TABLE_FIELD_EDIT_START,
      tableId,
      configurationId,
      field
    });
  },

  updateTableFieldEdit(configurationId, tableId, field, newValue) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.GOOD_DATA_WRITER_TABLE_FIELD_EDIT_UPDATE,
      configurationId,
      tableId,
      field,
      value: newValue
    });
  },

  cancelTableFieldEdit(configurationId, tableId, field) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.GOOD_DATA_WRITER_TABLE_FIELD_EDIT_CANCEL,
      tableId,
      configurationId,
      field
    });
  },

  startTableColumnsEdit(configurationId, tableId) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.GOOD_DATA_WRITER_COLUMNS_EDIT_START,
      configurationId,
      tableId
    });
  },

  cancelTableColumnsEdit(configurationId, tableId) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.GOOD_DATA_WRITER_COLUMNS_EDIT_CANCEL,
      configurationId,
      tableId
    });
  },

  updateTableColumnsEdit(configurationId, tableId, column) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.GOOD_DATA_WRITER_COLUMNS_EDIT_UPDATE,
      configurationId,
      tableId,
      column
    });
  },

  saveTableColumnsEdit(configurationId, tableId) {
    let columns = goodDataWriterStore.getTableColumns(configurationId, tableId, 'editing');

    dispatcher.handleViewAction({
      type: constants.ActionTypes.GOOD_DATA_WRITER_COLUMNS_EDIT_SAVE_START,
      configurationId,
      tableId
    });

    columns = columns.map((column) => column.remove('gdName'));

    return goodDataWriterApi
      .updateTable(configurationId, tableId, { columns })
      .then(() => {
        this.loadReferencableTablesForce(configurationId);
        return dispatcher.handleViewAction({
          type: constants.ActionTypes.GOOD_DATA_WRITER_COLUMNS_EDIT_SAVE_SUCCESS,
          configurationId,
          tableId,
          columns: columns.toJS()
        });
      })
      .catch(function(e) {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.GOOD_DATA_WRITER_COLUMNS_EDIT_SAVE_ERROR,
          configurationId,
          tableId,
          error: e
        });
        throw e;
      });
  },

  uploadDateDimensionToGoodData(configurationId, dimensionName, pid) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.GOOD_DATA_WRITER_DATE_DIMENSION_UPLOAD_START,
      configurationId,
      dimensionName
    });

    return goodDataWriterApi
      .uploadDateDimension(configurationId, dimensionName, pid)
      .then(function(job) {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.GOOD_DATA_WRITER_DATE_DIMENSION_UPLOAD_SUCCESS,
          configurationId,
          dimensionName,
          job
        });

        return applicationActionCreators.sendNotification({
          message: dimensionUploadInitiated(job, dimensionName)
        });
      })
      .catch(function(e) {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.GOOD_DATA_WRITER_DATE_DIMENSION_UPLOAD_ERROR,
          configurationId,
          dimensionName,
          error: e
        });
        throw e;
      });
  },

  uploadToGoodData(configurationId, tableId = null) {
    let promise;
    dispatcher.handleViewAction({
      type: constants.ActionTypes.GOOD_DATA_WRITER_UPLOAD_START,
      configurationId,
      tableId
    });

    if (tableId) {
      promise = goodDataWriterApi.uploadTable(configurationId, tableId);
    } else {
      promise = goodDataWriterApi.uploadProject(configurationId);
    }

    return promise
      .then(function(job) {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.GOOD_DATA_WRITER_UPLOAD_SUCCESS,
          configurationId,
          tableId,
          job
        });

        if (tableId) {
          const table = goodDataWriterStore.getTable(configurationId, tableId);
          return applicationActionCreators.sendNotification({
            message: tableUploadInitiated(job, table)
          });
        } else {
          return applicationActionCreators.sendNotification({
            message: uploadInitiated(job)
          });
        }
      })
      .catch(function(e) {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.GOOD_DATA_WRITER_UPLOAD_ERROR,
          configurationId,
          tableId,
          error: e
        });
        throw e;
      });
  },

  resetTable(configurationId, tableId, pid) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.GOOD_DATA_WRITER_RESET_TABLE_START,
      configurationId,
      tableId
    });

    return goodDataWriterApi
      .resetTable(configurationId, tableId, pid)
      .then((job) => jobPoller.poll(applicationStore.getSapiTokenString(), job.url))
      .then(function(job) {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.GOOD_DATA_WRITER_RESET_TABLE_SUCCESS,
          configurationId,
          tableId
        });

        return applicationActionCreators.sendNotification({
          message: tableResetInitiated(job)
        });
      })
      .catch(function(e) {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.GOOD_DATA_WRITER_RESET_TABLE_ERROR,
          configurationId,
          tableId,
          error: e
        });
        throw e;
      });
  },

  synchronizeTable(configurationId, tableId, pid) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.GOOD_DATA_WRITER_SYNC_TABLE_START,
      configurationId,
      tableId
    });

    return goodDataWriterApi
      .synchronizeTable(configurationId, tableId, pid)
      .then(function(job) {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.GOOD_DATA_WRITER_SYNC_TABLE_SUCCESS,
          configurationId,
          tableId
        });

        return applicationActionCreators.sendNotification({
          message: dataSetSynchronizationInitiated(job)
        });
      })
      .catch(function(e) {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.GOOD_DATA_WRITER_SYNC_TABLE_ERROR,
          configurationId,
          tableId,
          error: e
        });
        throw e;
      });
  },

  loadDateDimensions(configurationId) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.GOOD_DATA_WRITER_LOAD_DATE_DIMENSIONS_START,
      configurationId
    });

    return goodDataWriterApi
      .getDateDimensions(configurationId)
      .then((dimensions) =>
        dispatcher.handleViewAction({
          type: constants.ActionTypes.GOOD_DATA_WRITER_LOAD_DATE_DIMENSIONS_SUCCESS,
          configurationId,
          dimensions
        })
      )
      .catch(function(e) {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.GOOD_DATA_WRITER_LOAD_DATE_DIMENSIONS_ERROR,
          configurationId,
          error: e
        });
        throw e;
      });
  },

  deleteDateDimension(configurationId, dateDimensionName) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.GOOD_DATA_WRITER_DATE_DIMENSION_DELETE_START,
      configurationId,
      dimensionName: dateDimensionName
    });

    return goodDataWriterApi
      .deleteDateDimension(configurationId, dateDimensionName)
      .then(() =>
        dispatcher.handleViewAction({
          type: constants.ActionTypes.GOOD_DATA_WRITER_DATE_DIMENSION_DELETE_SUCCESS,
          configurationId,
          dimensionName: dateDimensionName
        })
      )
      .catch(function(e) {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.GOOD_DATA_WRITER_DATE_DIMENSION_DELETE_ERROR,
          configurationId,
          dimensionName: dateDimensionName,
          error: e
        });
        throw e;
      });
  },

  updateNewDateDimension(configurationId, newDimension) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.GOOD_DATA_WRITER_NEW_DATE_DIMENSION_UPDATE,
      configurationId,
      dimension: newDimension
    });
  },

  saveNewDateDimension(configurationId) {
    let dateDimension = dimensionsStore.getNewDimension(configurationId);

    if (dateDimension.get('template') === constants.DateDimensionTemplates.CUSTOM) {
      dateDimension = dateDimension
        .set('template', dateDimension.get('customTemplate'))
        .delete('customTemplate');
    }

    dispatcher.handleViewAction({
      type: constants.ActionTypes.GOOD_DATA_WRITER_NEW_DATE_DIMENSION_SAVE_START,
      configurationId
    });

    return goodDataWriterApi
      .createDateDimension(configurationId, dateDimension.toJS())
      .then(function() {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.GOOD_DATA_WRITER_NEW_DATE_DIMENSION_SAVE_SUCCESS,
          configurationId,
          dimension: dateDimension
        });
        return dateDimension;
      })
      .catch(function(e) {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.GOOD_DATA_WRITER_NEW_DATE_DIMENSION_SAVE_ERROR,
          configurationId,
          error: e
        });
        throw e;
      });
  },

  deleteWriter(configurationId) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.GOOD_DATA_WRITER_DELETE_START,
      configurationId
    });

    return goodDataWriterApi
      .deleteWriter(configurationId)
      .then(() => installedComponentsApi.deleteConfiguration('gooddata-writer', configurationId))
      .then(function() {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.GOOD_DATA_WRITER_DELETE_SUCCESS,
          configurationId
        });

        return applicationActionCreators.sendNotification({
          message: 'Writer has been scheduled for removal!'
        });
      })
      .catch(function(e) {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.GOOD_DATA_WRITER_DELETE_ERROR,
          configurationId,
          error: e
        });
        throw e;
      });
  },

  setWriterTablesFilter(configurationId, query) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.GOOD_DATA_WRITER_TABLES_FILTER_CHANGE,
      filter: query,
      configurationId
    });
  },

  enableProjectAccess(configurationId, projectId) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.GOOD_DATA_WRITER_PROJECT_ACCESS_LOADING,
      configurationId,
      projectId
    });
    return goodDataWriterApi
      .enableProjectAccess(configurationId, projectId)
      .then((result) =>
        dispatcher.handleViewAction({
          type: constants.ActionTypes.GOOD_DATA_WRITER_PROJECT_ACCESS_ENABLE,
          configurationId,
          projectId,
          ssoLink: result.link,
          ssoProvider: result.ssoProvider,
          encryptedClaims: result.encryptedClaims
        })
      )
      .catch(function(e) {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.GOOD_DATA_WRITER_PROJECT_ACCESS_ERROR,
          configurationId,
          projectId
        });
        throw e;
      });
  },

  disableProjectAccess(configurationId, projectId) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.GOOD_DATA_WRITER_PROJECT_ACCESS_LOADING,
      configurationId,
      projectId
    });
    return goodDataWriterApi
      .disableProjectAccess(configurationId, projectId)
      .then(() =>
        dispatcher.handleViewAction({
          type: constants.ActionTypes.GOOD_DATA_WRITER_PROJECT_ACCESS_DISABLE,
          configurationId,
          projectId
        })
      )
      .catch(function(e) {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.GOOD_DATA_WRITER_PROJECT_ACCESS_ERROR,
          configurationId,
          projectId
        });
        throw e;
      });
  }
};
