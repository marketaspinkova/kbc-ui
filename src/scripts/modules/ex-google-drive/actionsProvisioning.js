import _ from 'underscore';
import {Map} from 'immutable';
import * as common from './common';
import storeProvisioning from './storeProvisioning';
import componentsActions from '../components/InstalledComponentsActionCreators';
import generateId from '../../utils/generateId';

const COMPONENT_ID = 'keboola.ex-google-drive';

// PROPTYPES HELPER:
/*
  localState: PropTypes.object.isRequired,
  updateLocalState: PropTypes.func.isRequired,
  prepareLocalState: PropTypes.func.isRequired
*/
const getFullName = common.sheetFullName;

export default function(configId) {
  const store = storeProvisioning(configId);

  function updateLocalState(path, data) {
    const ls = store.getLocalState();
    const newLocalState = ls.setIn([].concat(path), data);
    componentsActions.updateLocalState(COMPONENT_ID, configId, newLocalState, path);
  }

  function saveConfigData(data, waitingPath, changeDescription) {
    let dataToSave = data;
    // check default output bucket and save default if non set
    const ob = dataToSave.getIn(['parameters', 'outputBucket']);
    if (!ob) {
      dataToSave = dataToSave.setIn(['parameters', 'outputBucket'], common.getDefaultBucket(COMPONENT_ID, configId));
    }

    updateLocalState(waitingPath, true);
    return componentsActions.saveComponentConfigData(COMPONENT_ID, configId, dataToSave, changeDescription)
      .then(() => updateLocalState(waitingPath, false));
  }


  // returns localState for @path and function to update local state
  // on @path+@subPath
  function prepareLocalState(path) {
    const ls = store.getLocalState(path);
    const updateLocalSubstateFn = (subPath, newData)  =>  {
      if (_.isEmpty(subPath)) {
        return updateLocalState([].concat(path), newData);
      } else {
        return updateLocalState([].concat(path).concat(subPath), newData);
      }
    };
    return {
      localState: ls,
      updateLocalState: updateLocalSubstateFn,
      prepareLocalState: (newSubPath) => prepareLocalState([].concat(path).concat(newSubPath))
    };
  }

  function getFilenameFromSheet(sheet) {
    return `${sheet.get('fileId')}_${sheet.get('sheetId')}.csv`;
  }

  function updateProcessor(sheet, processor) {
    const filename = getFilenameFromSheet(sheet);
    const parameters = (new Map())
      .set('filename', filename)
      .set('transpose', processor.get('transpose'))
      .set('header_rows_count', processor.get('header_rows_count'))
      .set('header_column_names', processor.get('header_column_names'))
      .set('header_transpose_row', processor.get('header_transpose_row'))
      .set('header_transpose_column_name', processor.get('header_transpose_column_name'))
      .set('transpose_from_column', processor.get('transpose_from_column'));

    const processorToSave = (new Map())
      .setIn(['definition', 'component'], 'keboola.processor.transpose')
      .set('parameters', parameters);

    // add new processor
    if (store.processors.toSet().filter(p => p.getIn(['parameters', 'filename']) === filename).isEmpty()) {
      return store.processors.toSet().add(processorToSave);
    }
    // replace existing processor
    return store.processors.toSet().map(p => p.getIn(['parameters', 'filename']) === filename ? processorToSave : p);
  }

  function deleteProcessor(sheetId) {
    const sheet = store.sheets.find(p => p.get('id') === sheetId);
    const filename = getFilenameFromSheet(sheet);
    return store.processors.toSet().filter(p => p.getIn(['parameters', 'filename']) !== filename);
  }

  return {

    prepareLocalState: prepareLocalState,
    updateLocalState: updateLocalState,

    saveNewSheets(newSheets) {
      const sheetsToAdd = newSheets.map((s) => {
        const name = common.sanitizeTableName(getFullName(s, '-'));
        const existingIds = store.sheets.map((q) => q.get('id'));
        return s
          .set('id', generateId(existingIds))
          .set('enabled', true)
          .setIn(['header', 'rows'], 1)
          .set('outputTable', name);
      });

      const sheetsToSave = store.sheets.toSet().merge(sheetsToAdd);
      const data = store.configData.setIn(['parameters', 'sheets'], sheetsToSave);
      const savingPath = store.getSavingPath(['newSheets']);
      const plural = newSheets.count() > 1 ? 's' : '';
      return saveConfigData(data, savingPath, `Add ${newSheets.count()} sheet${plural}`);
    },

    saveEditingSheet(sheet, processor) {
      const sheetId = sheet.get('id').toString();
      const msg = `Update ${getFullName(sheet)}`;
      const sheets = store.sheets.map((q) => q.get('id').toString() === sheetId ? sheet : q);
      const processors = updateProcessor(sheet, processor);

      const data = store.configData
        .setIn(['parameters', 'sheets'], sheets)
        .setIn(['processors', 'after'], processors)
      ;
      const savingPath = store.getSavingPath(['updatingSheets']);
      return saveConfigData(data, savingPath, msg);
    },

    deleteSheet(sheetId) {
      const newSheets = store.sheets.filter((q) => q.get('id').toString() !== sheetId.toString());
      const processors = deleteProcessor(sheetId);
      const msg = `Remove ${getFullName(store.getConfigSheet(sheetId))}`;
      const data = store.configData
        .setIn(['parameters', 'sheets'], newSheets)
        .setIn(['processors', 'after'], processors)
      ;
      return saveConfigData(data, store.getPendingPath(['delete', sheetId]), msg);
    },

    toggleSheetEnabled(sheetId) {
      let newSheet = store.getConfigSheet(sheetId);
      const msg = `${newSheet.get('enabled') ? 'Disable' : 'Enable'} extraction of ${getFullName(newSheet)}`;
      newSheet = newSheet.set('enabled', !newSheet.get('enabled'));
      const newSheets = store.sheets.map((q) => q.get('id').toString() === sheetId.toString() ? newSheet : q);
      const data = store.configData.setIn(['parameters', 'sheets'], newSheets);
      return saveConfigData(data, store.getPendingPath(['toggle', sheetId]), msg);
    }
  };
}
