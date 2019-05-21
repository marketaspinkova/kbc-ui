import installedComponentsActions from '../components/InstalledComponentsActionCreators';
import InstalledComponentStore from '../components/stores/InstalledComponentsStore';
import {List, Map, fromJS, Iterable} from 'immutable';
import _ from 'underscore';

const componentId = 'geneea.nlp-analysis-v2';

const PRIMARYKEY = ['columns', 'id']; // id of the document
const DATACOLUMN = ['columns', 'text']; // main text of the document
const TITLE = ['columns', 'title']; // optional title of the document
const LEAD = ['columns', 'lead']; // optional lead or abstract of the document


const ANALYSIS = 'analysis_types';
const LANGUAGE = 'language';
const ADVANCED = 'advanced';
const DOMAIN = 'domain';
const BETA = 'use_beta';
const CORRECTION = 'correction';
const DIACRITIC = 'diacritization';

export const params = {LANGUAGE, PRIMARYKEY, TITLE, LEAD, ANALYSIS, DATACOLUMN, DOMAIN, BETA, CORRECTION, DIACRITIC, ADVANCED};

function getLocalState(configId, path) {
  const state = InstalledComponentStore.getLocalState(componentId, configId);
  if (path) {
    return state.getIn(path);
  } else {
    return state;
  }
}

export function updateLocalState(configId, path, data) {
  const newState = InstalledComponentStore.getLocalState(componentId, configId).setIn(path, data);
  installedComponentsActions.updateLocalState(componentId, configId, newState, path);
}

function getConfigData(configId) {
  return InstalledComponentStore.getConfigData(componentId, configId) || Map();
}

export function getInTable(configId) {
  const configData = getConfigData(configId);
  return configData.getIn(['storage', 'input', 'tables', 0], Map()).get('source');
}

function setEditingData(configId, data) {
  updateLocalState(configId, ['editing'], data);
}

export function updateEditingValue(configId, prop, value) {
  const data = getLocalState(configId, ['editing']) || Map();
  setEditingData(configId, data.setIn([].concat(prop), value));
}

export function getEditingValue(configId, prop) {
  return getLocalState(configId, ['editing'].concat(prop));
}

export function startEditing(configId) {
  const configData = getConfigData(configId);
  let editingData = _.reduce(_.values(params), (memo, key) => {
    let defaultVal = null;
    if (key === ANALYSIS) {
      defaultVal = List();
    }
    if (key === LANGUAGE) {
      defaultVal = 'en';
    }
    if (key === BETA) {
      defaultVal = false;
    }
    if (key === CORRECTION) {
      defaultVal = 'none';
    }
    if (key === DIACRITIC) {
      defaultVal = 'none';
    }
    let value = configData.getIn(['parameters'].concat(key), defaultVal);
    if (key === ADVANCED) {
      const advancedMap = configData.getIn(['parameters', ADVANCED], Map()).toJS();
      if (_.isEmpty(advancedMap)) {
        value = '{}';
      } else {
        value = JSON.stringify(advancedMap, null, '  ');
      }
    }
    return memo.setIn([].concat(key), value);
  }, Map());
  editingData = editingData.set('intable', getInTable(configId) || '');
  setEditingData(configId, editingData);
}

export function isOutputValid(output) {
  return output.match(/(out|in)\..+\..*/);
}

const mandatoryParams = [PRIMARYKEY, DATACOLUMN, ANALYSIS, 'intable'];
export function isValid(configId) {
  const isMissing = mandatoryParams.reduce((memo, param) => {
    let editingValue = getEditingValue(configId, param);
    if (editingValue && param === ANALYSIS) {
      editingValue = editingValue.toJS();
    }
    const isEmpty = Iterable.isIterable(editingValue) ? editingValue.count() === 0 : _.isEmpty(editingValue);
    return memo || isEmpty;
  }, false);
  let isAdvancedValid = true;
  try {
    JSON.parse(getEditingValue(configId, params.ADVANCED));
  } catch (e) {
    isAdvancedValid = false;
  }
  return (!isMissing) && isAdvancedValid;
}

export function cancel(configId) {
  setEditingData(configId, null);
}

// function getPrimaryKeysArray(inTablePrimaryKey, task) {
//   if (task === 'entities') return [inTablePrimaryKey, 'entity', 'type'];
//   if (task === 'hashtags') return [inTablePrimaryKey, 'hashtag'];
//   return [inTablePrimaryKey];
// }

// function hasPrimaryKeys(desiredPks, tablePks) {
//   const result = _.reduce(desiredPks, (memo, pk) => {
//     return tablePks.indexOf(pk) >= 0 && memo;
//   }, true);
//   return result;
// }

// function prepareOutTables(tasks, outBucket, primaryKey, allTables) {
//   let result = [];
//   for (let task of tasks) {
//     const tableId = `${outBucket}${task}`;
//     const table = allTables.get(tableId, Map());
//     const tableExists = !!(allTables.get(tableId, false));
//     const tablePks = table.get('primaryKey', List());
//     const outTablePks = getPrimaryKeysArray(primaryKey, task);
//     // table(@tablePks) contains primary keys that are needed by @outTablePks
//     const hasPrimaryKey = hasPrimaryKeys(outTablePks, tablePks);
//     result.push({
//       'source': `${tableId}.csv`,
//       'destination': tableId,
//       'primary_key': outTablePks,
//       'incremental': !tableExists || hasPrimaryKey
//     });
//   }
//   return result;
// }

export function updateEditingMapping(configId, newMapping) {
  updateEditingValue(configId, 'inputMapping', newMapping);
}

export function resetEditingMapping(configId, newIntableId) {
  const oldMapping = getInputMapping(configId, true);
  updateEditingValue(configId, 'inputMapping', fromJS({
    source: newIntableId,
    destination: newIntableId,
    days: oldMapping.get('days') || 2
  }));
}

export function getInputMapping(configId, isEditing) {
  const configData = getConfigData(configId);
  const ls = getLocalState(configId, ['editing']) || Map();
  const defaultMapping = fromJS({
    source: '',
    days: 2
  });
  const configMapping = configData.getIn(['storage', 'input', 'tables', 0], defaultMapping);
  const editingMapping = ls.get('inputMapping', configMapping);
  if (isEditing) {
    return editingMapping;
  } else {
    return configMapping;
  }
}

export function save(configId) {
  const data = getLocalState(configId, ['editing']);

  const inputMapping = getInputMapping(configId, true);

  const primaryKey = data.getIn(params.PRIMARYKEY);
  const textColumn = data.getIn(params.DATACOLUMN);
  const leadColumn = data.getIn(params.LEAD);
  const titleColumn = data.getIn(params.TITLE);

  const columns = primaryKey.push(textColumn, leadColumn || List(), titleColumn || List())
    .filter((c) => (List.isList(c) && c.count() > 0) || (!List.isList(c) && !!c));

  const storage = {
    input: {
      tables: [ fromJS(inputMapping.set('columns', columns.flatten().toSet()))]
    }
    // ,
    // output: {
    //   tables: prepareOutTables(data[params.ANALYSIS], data[params.OUTPUT], primaryKey, allTables)
  // }
  };

  const parameters = _.reduce(_.values(params), (memo, key) => {
    let valueToSet = data.getIn([].concat(key));
    if (key === params.ADVANCED) {
      valueToSet = Map(JSON.parse(valueToSet));
    }
    return memo.setIn([].concat(key), valueToSet);
  }, Map())
    .set('columns', data.get('columns').filter((c) => List.isList(c) && c.count() > 0));

  let config = fromJS({
    storage: storage,
    parameters: parameters.toJS()
  });
  const saveFn = installedComponentsActions.saveComponentConfigData;
  saveFn(componentId, configId, config).then( () => {
    return cancel(configId);
  });
}
