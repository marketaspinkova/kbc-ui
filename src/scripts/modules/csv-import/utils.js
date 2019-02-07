import {Map, List} from 'immutable';

const getDefaultTable = function(configId) {
  return 'in.c-csv-import.' + configId;
};


const createConfiguration = function(settings, configId) {
  let config = Map();

  if (settings.get('destination') && settings.get('destination') !== '') {
    config = config.set('destination', settings.get('destination'));
  } else {
    config = config.set('destination', getDefaultTable(configId));
  }

  config = config.set('incremental', settings.get('incremental', false));

  if (settings.get('primaryKey') && settings.get('primaryKey').count() > 0) {
    config = config.set('primaryKey', settings.get('primaryKey'));
  } else {
    config = config.set('primaryKey', List());
  }

  if (settings.get('delimiter') && settings.get('delimiter') !== '') {
    config = config.set('delimiter', settings.get('delimiter'));
  } else {
    config = config.set('delimiter', ',');
  }

  if (settings.has('enclosure')) {
    config = config.set('enclosure', settings.get('enclosure'));
  } else {
    config = config.set('enclosure', '"');
  }
  return config;
};

export default {
  getDefaultTable: getDefaultTable,
  createConfiguration: createConfiguration
};
