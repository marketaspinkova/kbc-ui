import { Map, fromJS } from 'immutable';
import S3 from 'aws-sdk/clients/s3';
import storeProvisioning from './storeProvisioning';
import componentsActions from '../components/InstalledComponentsActionCreators';
import storageApi from '../components/StorageApi';
import storageApiActions from '../components/StorageActionCreators';
import bucketsStore from '../components/stores/StorageBucketsStore';
import tablesStore from '../components/stores/StorageTablesStore';
import installedComponentsStore from '../components/stores/InstalledComponentsStore';

// utils
import {createConfiguration} from './utils';

const COMPONENT_ID = 'keboola.csv-import';

// PROPTYPES HELPER:
/*
  localState: PropTypes.object.isRequired,
  updateLocalState: PropTypes.func.isRequired,
*/

export default function(configId) {
  const store = storeProvisioning(configId);

  function updateLocalState(path, data) {
    const ls = installedComponentsStore.getLocalState(COMPONENT_ID, configId);
    const newLocalState = ls.setIn([].concat(path), data);
    componentsActions.updateLocalState(COMPONENT_ID, configId, newLocalState, path);
  }

  function removeFromLocalState(path) {
    const ls = installedComponentsStore.getLocalState(COMPONENT_ID, configId);
    const newLocalState = ls.deleteIn([].concat(path));
    componentsActions.updateLocalState(COMPONENT_ID, configId, newLocalState, path);
  }

  function getLocalState() {
    return installedComponentsStore.getLocalState(COMPONENT_ID, configId);
  }

  function editReset() {
    removeFromLocalState(['isChanged']);
    removeFromLocalState(['settings']);
    removeFromLocalState(['isDestinationEditing']);
  }

  function setFile(file) {
    updateLocalState(['file'], file);
  }

  function resetFileInput() {
    updateLocalState(['fileInputKey'], getLocalState().get('fileInputKey', 0) + 1);
  }

  function editChange(newSettings) {
    updateLocalState(['settings'], newSettings);
    if (!getLocalState().get('isChanged', false)) {
      updateLocalState(['isChanged'], true);
    }
  }

  function destinationEdit() {
    updateLocalState(['isDestinationEditing'], true);
    if (!getLocalState().get('isChanged', false)) {
      updateLocalState(['isChanged'], true);
    }
  }

  function editSave() {
    const localState = getLocalState();
    const config = createConfiguration(localState.get('settings', Map()), configId);
    removeFromLocalState(['isDestinationEditing']);
    updateLocalState(['isSaving'], true);
    return componentsActions.saveComponentConfigData(COMPONENT_ID, configId, config).then(() => {
      removeFromLocalState(['settings']);
      removeFromLocalState(['isSaving']);
      removeFromLocalState(['isChanged']);
    });
  }

  function resetForm() {
    resetFileInput();
    removeFromLocalState(['file']);
  }

  function resetUploadState() {
    removeFromLocalState(['uploadingMessage']);
    updateLocalState(['isUploading'], false);
  }

  function resultSuccess(message) {
    updateLocalState(['resultState'], 'success');
    updateLocalState(['resultMessage'], message);
  }

  function resultError(message) {
    updateLocalState(['resultState'], 'error');
    updateLocalState(['resultMessage'], message);
  }

  function dismissResult() {
    removeFromLocalState(['resultState']);
    removeFromLocalState(['resultMessage']);
  }

  function startUpload() {
    var params = {
      federationToken: true,
      notify: false,
      isEncrypted: true,
      name: getLocalState().get('file').name,
      sizeBytes: getLocalState().get('file').size
    };

    updateLocalState(['isUploading'], true);
    updateLocalState(['uploadingMessage'], 'Preparing upload');
    updateLocalState(['uploadingProgress'], 5);

    storageApi.prepareFileUpload(params).then(function(response) {
      const fileId = response.id;
      const awsParams = {
        credentials: {
          accessKeyId: response.uploadParams.credentials.AccessKeyId,
          secretAccessKey: response.uploadParams.credentials.SecretAccessKey,
          sessionToken: response.uploadParams.credentials.SessionToken
        },
        signatureVersion: 'v4',
        maxRetries: 0,
        region: response.region,
        httpOptions: {
          timeout: 0
        }
      };
      const s3params = {
        Key: response.uploadParams.key,
        Bucket: response.uploadParams.bucket,
        ACL: response.uploadParams.acl,
        ServerSideEncryption: response.uploadParams['x-amz-server-side-encryption'],
        Body: getLocalState().get('file')
      };

      updateLocalState(['uploadingMessage'], 'Uploading to S3');
      updateLocalState(['uploadingProgress'], 30);

      new S3(awsParams)
        .putObject(s3params)
        .on('httpUploadProgress', function(progress) {
          var addition = 0;
          if (progress.loaded && progress.total) {
            addition = 30 * (progress.loaded / progress.total);
          }
          updateLocalState(['uploadingProgress'], 30 + addition);
        })
        .send(function(err) {
          if (err) {
            resetUploadState();
            resultError(err.toString());
          } else {
            const tableId = store.settings.get('destination');
            const bucketId = tableId.substr(0, tableId.lastIndexOf('.'));
            const tableName = tableId.substr(tableId.lastIndexOf('.') + 1);

            const createBucketMetadata = function() {
              const bucketMetadata = fromJS({
                'KBC.createdBy.component.id': COMPONENT_ID,
                'KBC.createdBy.configuration.id': configId
              });
              return storageApi.saveBucketMetadata(bucketId, bucketMetadata, 'system');
            };

            const createTableMetadata = function() {
              const tableMetadata = fromJS({
                'KBC.createdBy.component.id': COMPONENT_ID,
                'KBC.createdBy.configuration.id': configId
              });
              return storageApi.saveTableMetadata(tableId, tableMetadata, 'system');
            };

            const updateTableMetadata = function() {
              const tableMetadata = fromJS({
                'KBC.lastUpdatedBy.component.id': COMPONENT_ID,
                'KBC.lastUpdatedBy.configuration.id': configId
              });
              return storageApi.saveTableMetadata(tableId, tableMetadata, 'system');
            };

            const createTable = function() {
              updateLocalState(['uploadingMessage'], 'Creating table ' + tableId);
              updateLocalState(['uploadingProgress'], 75);
              var createTableParams = {
                name: tableName,
                dataFileId: fileId
              };
              if (store.settings.get('primaryKey')) {
                createTableParams.primaryKey = store.settings.get('primaryKey').toJS().join(',');
              }
              if (store.settings.get('delimiter')) {
                createTableParams.delimiter = store.settings.get('delimiter');
              }
              createTableParams.enclosure = store.settings.get('enclosure');

              storageApiActions.createTable(bucketId, createTableParams)
                .then(function() {
                  createTableMetadata();
                  resetUploadState();
                  resetForm();
                  resultSuccess('CSV file successfully imported.');
                }).catch(function(e) {
                  resetUploadState();
                  resultError(e);
                });
            };

            if (!bucketsStore.hasBucket(bucketId)) {
              // create bucket and table

              updateLocalState(['uploadingMessage'], 'Creating bucket ' + bucketId);
              updateLocalState(['uploadingProgress'], 60);

              const createBucketParams = {
                name: bucketId.substr(bucketId.indexOf('-') + 1),
                stage: bucketId.substr(0, bucketId.lastIndexOf('.'))
              };
              storageApiActions.createBucket(createBucketParams)
                .then(createBucketMetadata)
                .then(createTable)
                .catch(function(e) {
                  resetUploadState();
                  resultError(e);
                });
            } else if (tablesStore.hasTable(tableId)) {
              // table exist? load
              const loadTableParams = {
                dataFileId: fileId
              };

              store.settings.get('incremental') && (loadTableParams.incremental = store.settings.get('incremental'));
              store.settings.get('delimiter') && (loadTableParams.delimiter = store.settings.get('delimiter'));
              loadTableParams.enclosure = store.settings.get('enclosure');

              updateLocalState(['uploadingMessage'], 'Loading into table ' + tableId);
              updateLocalState(['uploadingProgress'], 90);
              storageApiActions.loadTable(tableId, loadTableParams).then(function() {
                updateTableMetadata();
                resetUploadState();
                resetForm();
                resultSuccess('CSV file successfully imported.');
              }).catch(function(e) {
                resetUploadState();
                resultError(e);
              });
            } else {
              createTable();
            }
          }
        });
    });
  }

  return {
    startUpload,
    editReset,
    editSave,
    setFile,
    editChange,
    dismissResult,
    destinationEdit
  };
}
